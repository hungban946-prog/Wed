const gif = document.getElementById('gif');
  const question = document.getElementById('question');
  const btnContainer = document.getElementById('btnContainer');
  let yesBtnSize = 18;
  let noCount = 0;

  let firstGif = "https://media.tenor.com/76BaX0eo304AAAAj/kitty-kitty-heart.gif";
  let gifs = [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXR1eTJuMHUzNThtcnh6cWFydTc2cmU5MWZhZG5nd3pmNWRjNmttciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MDJ9IbxxvDUQM/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExaW1peHExMTRpNHFibDB5NXo1bGZtOG9yeXM3ZXN0Nm9hNTBuMm1jMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3FmUiYq9CD6R4RK94M/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdnZ3NkazlkeW03NW8zMmN1a2JrbGNzOGYxMGpjbW8zNXBoM2JyNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/dBrYtNwNaYJKkOQFXr/giphy.gif",
    "https://media1.tenor.com/m/f6ts3WWJa-8AAAAC/funny-cats-funny.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dWJhZmZhMXR1d2s4aWtvb3UxOHBqc2ZiM2tkdmJvcXN5d2s4ZXVzNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l41JWw65TcBGjPpRK/giphy.gif",
    "https://media.tenor.com/C35t4Pf5GlgAAAAi/peach-and-goma-cute.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExanJ2ZnJhOG9leDh1MGtxMnowZmg1MDdjNW9tc2VxMDZ6b3phZWkyYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/d2lcHJTG5Tscg/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MHQ3MDdzMml6OHcxZG1qZGtkcWJ0dDExZXFkbHpyZzhoamwwbTE3YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GyNeHf5IrpQNG/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dmZ1YnNna21sd3Q2NjNoZ21jZjBvazdsa3R3NGdhODRreW9tZjNyMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/11cv676Si07aEw/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWF6Z3pqazA3NzV5dXB3ejJjN3ZhMTFwbWFnZ2VvNTh4YXF5MTh6aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Z21HJj2kz9uBG/giphy.gif",
    "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3J4eWJlcHBvczhjbjllNWVmODcwMDFycm1uZHpvOGtxcXdtMzl3YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4N1wOi78ZGzSB6H7vK/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTFqb2ZnbGJ4aWlnMnZrOGg5MnUxazJlb2RjczF3azNodmF0dWo4YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sh11BmCf8HY8F0c5GN/giphy.gif"
  ];

  // Mảng các câu hỏi/thông điệp
  let questions = [
    "Suy nghĩ lại chưa nè?",
    "Thật sự không iu luôn hả?",
    "Anh buồn quá đi...",
    "Em dễ thương mà, iu anh đi!",
    "Tại sao em lại không iu anh?",
    "Không iu là anh khóc đó",
    "Em chắc chắn chưa?",
    "Năn nỉ đó đồng ý đi",
    "Thui mà đồng ý đuy...",
    "Anh không tốt ở đâu sao :((",
    "Yêu anh chở đi chơi nè...",
    "Một lần nữa, em có iu anh không?"
  ];
  

  function initButtons() {
    btnContainer.innerHTML = `
      <button class="btn yes" id="yesBtn">Yêu Nhắm</button>
      <button class="btn no" id="noBtn">Không iu</button>
    `;
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');

    yesBtn.addEventListener('click', () => yesClick(yesBtn));
    noBtn.addEventListener('click', () => noClick(yesBtn, noBtn));
  }

  function resetPage() {
  noCount = 0;
  yesBtnSize = 18;
  question.textContent = "Em có iu anh hông ?";
  gif.src = firstGif;
  // Xử lý fallback nếu gif không load được
  gif.onerror = function() {
    gif.src = firstGif;
  };
  initButtons();
  }

  function yesClick(yesBtn) {
    gif.src = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNm56dWNmY2ZrMHA4cHRta3R0cXBhN2l2dHY4cGw5ZnlwMnBzeWpjZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QEN54dmAJuTF0wBWXz/giphy.gif";
    question.textContent = "Anh cũng yêu em nhìu moa moa💗";
    btnContainer.innerHTML = "";
  }

  function noClick(yesBtn, noBtn) {
  yesBtnSize += 30; // Tăng nhanh hơn mỗi lần ấn
  yesBtn.style.fontSize = yesBtnSize + 'px';
  noCount++;
  let gifIndex = (noCount - 1) % gifs.length;
  gif.src = gifs[gifIndex];
  gif.onerror = function() {
    gif.src = firstGif;
  };

  let qIndex = (noCount - 1) % questions.length;
  question.textContent = questions[qIndex];

  yesBtn.textContent = "Yêu nhắm";
  yesBtn.classList.remove('love');

  if (!document.getElementById('noBtn')) {
    const newNoBtn = document.createElement('button');
    newNoBtn.className = 'btn no';
    newNoBtn.id = 'noBtn';
    newNoBtn.textContent = 'Không iu';
    btnContainer.appendChild(newNoBtn);
    newNoBtn.addEventListener('click', () => noClick(yesBtn, newNoBtn));
  }

  yesBtn.onclick = () => yesClick(yesBtn);
  }

  resetPage();
