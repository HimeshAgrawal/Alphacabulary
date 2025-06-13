const wordForm = document.getElementById('wordForm');
const wordInput = document.getElementById('word');
const meaningInput = document.getElementById('meaning');
const wordListDiv = document.getElementById('wordList');

// Load words on page load
window.onload = () => {
  displayWords();
};

// Save word to LocalStorage
wordForm.onsubmit = (e) => {
  e.preventDefault();
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();

  if (!word || !meaning) return;

  const words = JSON.parse(localStorage.getItem('vocabWords')) || [];
  words.push({ word, meaning });
  localStorage.setItem('vocabWords', JSON.stringify(words));

  wordInput.value = '';
  meaningInput.value = '';
  displayWords();
};

// Display words alphabetically
function displayWords() {
  const words = JSON.parse(localStorage.getItem('vocabWords')) || [];
  const sorted = words.sort((a, b) => a.word.localeCompare(b.word));

  wordListDiv.innerHTML = '';
  sorted.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'word-card';

    card.innerHTML = `
      <div class="word-header">
        <h3>${entry.word}</h3>
        <button class="delete-btn" onclick="deleteWord(${index})">Delete</button>
      </div>
      <p>${entry.meaning}</p>
    `;

    wordListDiv.appendChild(card);
  });
}

// Delete a word
function deleteWord(index) {
  const words = JSON.parse(localStorage.getItem('vocabWords')) || [];
  words.splice(index, 1);
  localStorage.setItem('vocabWords', JSON.stringify(words));
  displayWords();
}

function exportToPDF() {
  const element = document.getElementById('wordList');
  const opt = {
    margin: 0.5,
    filename: 'vocabulary.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
}
// Export words to Excel file
function exportToExcel() {
  const words = JSON.parse(localStorage.getItem('vocabWords')) || [];
  const data = words.map(entry => ({ Word: entry.word, Meaning: entry.meaning }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vocabulary");

  XLSX.writeFile(workbook, "vocabulary.xlsx");
}

// Upload Excel file
document.getElementById('excelUpload').addEventListener('change', handleExcelUpload);

function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const newWords = [];

    jsonData.forEach(row => {
      if (row.Word && row.Meaning) {
        newWords.push({
          word: row.Word.trim(),
          meaning: row.Meaning.trim()
        });
      }
    });

    // Overwrite localStorage with only new words
    localStorage.setItem('vocabWords', JSON.stringify(newWords));
    displayWords();
  };

  reader.readAsArrayBuffer(file);
}

