let currentSpanIndex = -1;
let lastSearchQuery = '';
const savedTextBoxes = {};
const savedSearchQueries = {};

function saveTextBoxes() {
  if (currentSpanIndex != -1) {
    const textBoxPairs = document.querySelectorAll('.text-box-pair');
    savedTextBoxes[currentSpanIndex] = [];
    textBoxPairs.forEach(pair => {
      const sourceSpanTextBox = pair.querySelector('.source-span');
      const reasonTextBox = pair.querySelector('.reason');
      const supportContradictDropdown = pair.querySelector('.support-contradict-dropdown');
      savedTextBoxes[currentSpanIndex].push([sourceSpanTextBox.value, reasonTextBox.value, supportContradictDropdown.value]);
    });
  }
}

function showPopup(index) {
  const popup = document.getElementById('popup');
  const summarySpan = document.querySelectorAll('.summary span.highlighted')[index];
  const summaryContainer = document.querySelector('.summary');

  // Calculate the position of the summary span
  const summarySpanRect = summarySpan.getBoundingClientRect();
  const summaryRect = summaryContainer.getBoundingClientRect();

  // Set the position of the popup
  popup.style.top = (summarySpanRect.top + summarySpanRect.height - summaryRect.top + summaryContainer.scrollTop) + 'px';

  // Show the popup
  popup.style.display = 'block';

  // Set the current span index
  currentSpanIndex = index;

  // Load the saved text boxes for this span or create a new text box by default
  const container = document.querySelector('.text-boxes-container');
  container.innerHTML = '';

  // Display the corresponding highlighted span text above the text boxes
  const spanText = document.createElement('p');
  spanText.className = 'span-text';
  spanText.textContent = document.querySelectorAll('.highlighted')[currentSpanIndex].textContent;
  container.appendChild(spanText);

  // Add a "Clear all" button above the text boxes
  const clearAllButton = document.createElement('button');
  clearAllButton.textContent = 'Clear all';
  clearAllButton.className = 'clear-all-button'; // Add the class to the button
  clearAllButton.addEventListener('click', () => {
    // Ask for confirmation before clearing text boxes
    if (confirm('Are you sure you want to clear all text boxes for this span?')) {
      // Remove all existing text box pairs for the current summary span
      container.querySelectorAll('.text-box-pair').forEach(pair => {
        pair.remove();
      });
      addTextBox();
      saveToLocalStorage();
      updateSubmitAnnotationsButton();
    }
  });
  container.appendChild(clearAllButton);

  if (savedTextBoxes[currentSpanIndex]) {
    savedTextBoxes[currentSpanIndex].forEach(([sourceSpanText, reasonText, dropdownValue]) => {
      addTextBox(sourceSpanText, reasonText, dropdownValue);
    });
  } else {
    addTextBox();
  }
}

function saveToLocalStorage() {
  if (currentSpanIndex != -1) {
    saveTextBoxes();
  }

  localStorage.setItem('savedData', JSON.stringify(savedTextBoxes));
  updateSubmitAnnotationsButton();
}

function loadFromLocalStorage() {
  const savedData = localStorage.getItem('savedData');

  if (savedData) {
    Object.assign(savedTextBoxes, JSON.parse(savedData));
  } else {
    document.querySelectorAll('.summary span.highlighted').forEach((_, index) => {
      savedTextBoxes[index] = [];
    });
  }

  updateSubmitAnnotationsButton();
}

function loadSearchQueriesFromLocalStorage() {
  console.log(savedSearchQueries)
  const savedData = localStorage.getItem('savedSearchQueries');

  if (savedData) {
    // Load the saved search queries
    Object.assign(savedSearchQueries, JSON.parse(savedData));
  }
}

loadFromLocalStorage();
loadSearchQueriesFromLocalStorage();

document.querySelectorAll('.summary span.highlighted').forEach((span, index) => {
  // Add an index indicator for each highlighted summary span
  const indexIndicator = document.createElement('span');
  indexIndicator.className = 'index-indicator';
  indexIndicator.textContent = index + 1;
  span.appendChild(indexIndicator);

  span.addEventListener('click', () => {
    // Save the current text boxes before showing the new popup
    if (document.getElementById('popup').style.display === 'block') {
      saveTextBoxes();
    }

    showPopup(index);
  });
});

function addTextBox(sourceSpanText = '', reasonText = '', dropdownValue = '') {
  const container = document.querySelector('.text-boxes-container');

  // Create a div for each pair of text boxes
  const textBoxPair = document.createElement('div');
  textBoxPair.className = 'text-box-pair';

  // Create a div for "source span" text box and dropdown
  const sourceSpanDiv = document.createElement('div');
  sourceSpanDiv.style.display = 'flex';

  // Create "source span" text box
  const sourceSpanTextBox = document.createElement('textarea');
  sourceSpanTextBox.className = 'text-box source-span';
  sourceSpanTextBox.placeholder = 'Source span';
  sourceSpanTextBox.value = sourceSpanText;
  sourceSpanTextBox.addEventListener('input', () => {
    resizeTextBox(sourceSpanTextBox);
    saveToLocalStorage();
    updateSubmitAnnotationsButton();
  });
  sourceSpanDiv.appendChild(sourceSpanTextBox);

  // Create a dropdown for "Support" and "Contradict"
  const supportContradictDropdown = document.createElement('select');
  supportContradictDropdown.className = 'support-contradict-dropdown';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Choose...';
  supportContradictDropdown.appendChild(defaultOption);
  const supportOption = document.createElement('option');
  supportOption.value = 'Support';
  supportOption.textContent = 'Support';
  supportContradictDropdown.appendChild(supportOption);
  const contradictOption = document.createElement('option');
  contradictOption.value = 'Contradict';
  contradictOption.textContent = 'Contradict';
  supportContradictDropdown.appendChild(contradictOption);
  supportContradictDropdown.value = dropdownValue;
  supportContradictDropdown.addEventListener('change', () => {
    saveToLocalStorage();
    updateSubmitAnnotationsButton();
  });
  supportContradictDropdown.addEventListener('change', () => {
    saveToLocalStorage();
    updateSubmitAnnotationsButton();
  });

  sourceSpanDiv.appendChild(supportContradictDropdown);

  textBoxPair.appendChild(sourceSpanDiv);

  // Create a div for "reason" text box and "Remove" button
  const reasonDiv = document.createElement('div');
  reasonDiv.style.display = 'flex';

  // Create "reason" text box
  const reasonTextBox = document.createElement('textarea');
  reasonTextBox.className = 'text-box reason';
  reasonTextBox.placeholder = 'Reason';
  reasonTextBox.value = reasonText;
  reasonTextBox.addEventListener('input', () => {
    resizeTextBox(reasonTextBox);
    saveToLocalStorage();
    updateSubmitAnnotationsButton();
  });
  reasonDiv.appendChild(reasonTextBox);

  // Create "Remove" button
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove pair';
  removeButton.className = 'remove-button';
  removeButton.addEventListener('click', () => {
    // Ask for confirmation before removing the text box pair
    if (confirm('Are you sure you want to remove this annotation pair?')) {
      textBoxPair.remove();
      saveToLocalStorage();
      updateSubmitAnnotationsButton();
    }
  });
  reasonDiv.appendChild(removeButton);

  // Append the reason div to the text box pair
  textBoxPair.appendChild(reasonDiv);

  // Append the pair of text boxes to the container
  container.appendChild(textBoxPair);

  // Resize the text boxes initially
  resizeTextBox(sourceSpanTextBox);
  resizeTextBox(reasonTextBox);
}

// Close the popup when clicking outside of it
document.addEventListener('click', function (event) {
  const summaryDiv = document.querySelector('.summary');
  const popup = document.getElementById('popup');

  if (summaryDiv.contains(event.target) && !event.target.classList.contains('highlighted') && !popup.contains(event.target)) {
    saveToLocalStorage();
    popup.style.display = 'none';
  }
});

const searchText = document.getElementById('search-text');
const caseSensitive = document.getElementById('case-sensitive');
const searchButton = document.getElementById('search-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const matchCounter = document.getElementById('match-counter');
let matches = [];
let currentIndex = 0;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function search() {
  const bookText = document.querySelector('.book-text');
  const searchValue = searchText.value;

  // If the search value is the same as the last query, don't perform a new search
  if (searchValue === lastSearchQuery) {
    return;
  }

  let matchSpans = bookText.querySelectorAll('.match');
  matchSpans.forEach(span => {
    span.classList.remove('selected-match');
    span.classList.remove('match');
    // Wrap the text content in a text node and replace the span with it
    const textNode = document.createTextNode(span.textContent);
    span.parentElement.replaceChild(textNode, span);
  });

  lastSearchQuery = searchValue;

  // Save the search query for the current summary span or as a separate entry if no summary span is selected
  if (currentSpanIndex != -1) {
    if (savedSearchQueries[currentSpanIndex]) {
      savedSearchQueries[currentSpanIndex].push(searchValue);
    } else {
      savedSearchQueries[currentSpanIndex] = [searchValue];
    }
  } else {
    if (savedSearchQueries.noSpan) {
      savedSearchQueries.noSpan.push(searchValue);
    } else {
      savedSearchQueries.noSpan = [searchValue];
    }
  }

  // Save the updated search queries to local storage
  saveSearchQueriesToLocalStorage();

  // Remove existing matches
  matches = [];
  currentIndex = 0;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = bookText.innerHTML;
  bookText.innerHTML = '';

  function findTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Search and replace in text nodes only
      let lastIndex = 0;
      let match;

      const searchString = node.textContent;
      const regex = new RegExp(escapeRegExp(searchValue), 'gi');

      while ((match = regex.exec(searchString)) !== null) {
        matches.push(match);

        // Add the text before the match
        node.parentElement.insertBefore(document.createTextNode(searchString.substring(lastIndex, match.index)), node);

        // Add the matched text with a span
        const matchSpan = document.createElement('span');
        matchSpan.className = 'match';
        matchSpan.textContent = match[0];
        node.parentElement.insertBefore(matchSpan, node);

        lastIndex = regex.lastIndex;
      }

      // Add the remaining text
      node.parentElement.insertBefore(document.createTextNode(searchString.substring(lastIndex)), node);
      node.remove();
    } else {
      // Recursively search in child nodes
      node.childNodes.forEach(findTextNodes);
    }
  }

  findTextNodes(tempDiv);

  bookText.innerHTML = tempDiv.innerHTML;

  if (matches.length > 0) {
    selectMatch(0);
  }

  updateCounter();
}

function selectMatch(index) {
  const matchSpans = document.querySelectorAll('.match');
  matchSpans.forEach(span => span.classList.remove('selected-match'));

  if (matches.length > 0) {
    currentIndex = ((index % matches.length) + matches.length) % matches.length;
    matchSpans[currentIndex].classList.add('selected-match');
    matchSpans[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  updateCounter();
}

function updateCounter() {
  matchCounter.textContent = matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0';
}

searchButton.addEventListener('click', search);
prevButton.addEventListener('click', () => selectMatch(currentIndex - 1));
nextButton.addEventListener('click', () => selectMatch(currentIndex + 1));

searchText.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    search();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault(); // Prevent scrolling
    selectMatch(currentIndex - 1);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault(); // Prevent scrolling
    selectMatch(currentIndex + 1);
  }
});

const clearButton = document.getElementById('clear-button');

function clearMatches() {
  const bookText = document.querySelector('.book-text');

  const matchSpans = bookText.querySelectorAll('.match');
  matchSpans.forEach(span => {
    span.classList.remove('selected-match');
    span.classList.remove('match');
    // Wrap the text content in a text node and replace the span with it
    const textNode = document.createTextNode(span.textContent);
    span.parentElement.replaceChild(textNode, span);
  });

  matches = [];
  currentIndex = 0;
  updateCounter();
  searchText.value = '';
  lastSearchQuery = '';
}

clearButton.addEventListener('click', clearMatches);

function resizeTextBox(textBox) {
  // Set the height to 'auto' so the text box can shrink if needed
  textBox.style.height = 'auto';

  // Set the new height based on the scroll height
  textBox.style.height = textBox.scrollHeight + 'px';
}

function updateSubmitAnnotationsButton() {
  const submitAnnotationsButton = document.getElementById('submit-annotations');
  let allSpansHaveValidPairs = true;

  Object.values(savedTextBoxes).forEach(spanTextBoxes => {
    const hasValidPair = spanTextBoxes.some(([sourceSpanText, reasonText, dropdownValue]) => {
      return sourceSpanText.trim() !== '' && reasonText.trim() !== '' && (dropdownValue === 'Support' || dropdownValue === 'Contradict');
    });

    if (!hasValidPair) {
      allSpansHaveValidPairs = false;
    }
  });

  submitAnnotationsButton.disabled = !allSpansHaveValidPairs;
}

const clearAllAnnotationsButton = document.getElementById('clear-annotations');

clearAllAnnotationsButton.addEventListener('click', () => {
  // Ask for confirmation before clearing all annotations
  if (confirm('Are you sure? This will remove all current annotations, and this action cannot be undone.')) {
    // Clear savedTextBoxes object
    Object.keys(savedTextBoxes).forEach(key => {
      savedTextBoxes[key] = [];
    });

    // Clear savedSearchQueries object
    Object.keys(savedSearchQueries).forEach(key => {
      savedSearchQueries[key] = [];
    });

    // Add an empty text box pair for each highlighted summary span
    document.querySelectorAll('.summary span.highlighted').forEach((_, index) => {
      savedTextBoxes[index].push(['', '']);
    });

    localStorage.clear();

    // Update the "Submit annotations" button
    updateSubmitAnnotationsButton();

    // Hide the popup and reset currentSpanIndex
    document.getElementById('popup').style.display = 'none';
    currentSpanIndex = -1;
  }
});

function saveSearchQueriesToLocalStorage() {
  localStorage.setItem('savedSearchQueries', JSON.stringify(savedSearchQueries));
}

async function submitAnnotations() {
  // Prepare the data to be sent
  const data = {
    link: window.location.href,
    textBoxes: savedTextBoxes,
    searchQueries: savedSearchQueries
  };

  try {
    // Send the data to the backend using a POST request
    const response = await fetch('http://arkham.cs.umass.edu:8877/submit_annotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    // Check if the request was successful
    if (response.ok) {
      const result = await response.json();
      console.log('Data submitted successfully:', result);
      alert('Annotations submitted successfully!');
    } else {
      console.error('Error submitting data:', response.statusText);
      alert('An error occurred while submitting annotations. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting data:', error);
    alert('An error occurred while submitting annotations. Please try again.');
  }
}

const submitAnnotationsButton = document.getElementById('submit-annotations');
submitAnnotationsButton.addEventListener('click', submitAnnotations);