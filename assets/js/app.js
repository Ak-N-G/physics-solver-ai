// Duplicate app logic for root static hosting
(function(){
  function generateGoogleSearchLink(query){
    if(!query) return "";
    return `https://www.google.com/search?q=${encodeURIComponent(query)}+physics+problem`;
  }

  const SERVER_ENDPOINT = (window.SERVER_ENDPOINT && window.SERVER_ENDPOINT.replace(/\/$/, '')) || '';
  const DEFAULT_REMOTE = 'https://physics-solver-ai.onrender.com';
  const API_PATH = SERVER_ENDPOINT ? `${SERVER_ENDPOINT}/ask-gemini` : `/ask-gemini`;

  async function callGemini(question){
    const url = API_PATH || `${DEFAULT_REMOTE}/ask-gemini`;
    try{
      const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({question})
      });
      if(!response.ok) throw new Error('Network response not ok');
      const data = await response.json();
      return data.answer || 'Gemini AI did not return an answer.';
    }catch(err){
      return `Error reaching Gemini AI: ${err.message}`;
    }
  }

  const solveBtn = document.getElementById('solveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const input = document.getElementById('questionInput');
  const outputDiv = document.getElementById('output');
  const searchDiv = document.getElementById('searchLink');
  const statusDiv = document.getElementById('status');
  const copyBtn = document.getElementById('copyAnswerBtn');

  function setStatus(msg, isError){
    statusDiv.textContent = msg || '';
    statusDiv.style.color = isError ? '#ff9b9b' : '';
  }

  async function solve(){
    const question = input.value.trim();
    if(!question){
      outputDiv.textContent = 'Please enter a physics question.';
      searchDiv.innerHTML = '';
      return;
    }
    solveBtn.disabled = true;
    solveBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Solving...';
    setStatus('');

    const answer = await callGemini(question);

    outputDiv.textContent = answer;
    const googleLink = generateGoogleSearchLink(question);
    searchDiv.innerHTML = `<a href="${googleLink}" target="_blank">🔍 Search Google for more info</a>`;

    // Render math (KaTeX) if available. Supports inline $...$ and display $$...$$.
    try {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(outputDiv, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false
        });
      }
    } catch (err) {
      console.warn('KaTeX render error:', err);
    }

    solveBtn.disabled = false;
    solveBtn.textContent = 'Solve';
  }

  solveBtn.addEventListener('click', solve);
  clearBtn.addEventListener('click', ()=>{ input.value=''; outputDiv.textContent='Answers will appear here.'; searchDiv.innerHTML=''; setStatus(''); });

  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
      e.preventDefault(); solve();
    }
  });

  document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', ()=>{ input.value = c.textContent; }));

  if(copyBtn){
    copyBtn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(outputDiv.textContent || '');
        setStatus('Answer copied to clipboard');
      }catch(err){
        setStatus('Copy failed', true);
      }
    });
  }
})();
