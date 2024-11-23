document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calculatorForm");
  const resultsDiv = document.querySelector(".calculator__results");
  const examInputs = document.getElementById("examInputs");

  // Скрытие блока "examInputs" по умолчанию
  if (examInputs) {
    examInputs.style.display = "none";
  }

  // Отображение блока "examInputs" при выборе типа
  document.querySelectorAll('input[name="type"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      examInputs.style.display = radio.value === "exam" ? "block" : "none";
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Скрыть предыдущий результат перед расчетом
    resultsDiv.classList.remove("visible");

    setTimeout(() => {
      const worksCount = Math.min(Number(document.getElementById("worksCount").value), 16);
      const works = [];
      let totalWeight = 0;

      for (let i = 1; i <= worksCount; i++) {
        const weight = parseFloat(document.getElementById(`weight${i}`).value) || 0;
        const maxPoints = parseFloat(document.getElementById(`maxPoints${i}`).value) || 0;
        const achievedPoints = parseFloat(document.getElementById(`achievedPoints${i}`).value) || 0;

        if (maxPoints > 0 && weight > 0) {
          works.push({ weight, scoreFraction: achievedPoints / maxPoints });
          totalWeight += weight;
        }
      }

      if (totalWeight === 0) {
        resultsDiv.innerHTML = "<span style='color:red;'>Ошибка:</span> суммарный вес равен нулю.";
        resultsDiv.classList.add("visible");
        return;
      }

      // Расчет текущей успеваемости
      const currentPerformance = works.reduce(
        (sum, work) => sum + work.scoreFraction * (work.weight / totalWeight),
        0
      );
      const percentage = (currentPerformance * 100).toFixed(2);
      let resultMessage = `<strong>Текущая успеваемость:</strong> ${percentage}%`;

      // Проверка данных по экзамену/зачету
      const type = document.querySelector('input[name="type"]:checked').value;
      if (type === "exam") {
        const examScore = parseFloat(document.getElementById("examScore").value) || 0;
        const examMaxScore = parseFloat(document.getElementById("examMaxScore").value) || 0;

        if (examMaxScore <= 0) {
          resultsDiv.innerHTML += "<br><span style='color:red;'>Ошибка:</span> Максимальный балл за экзамен должен быть больше нуля.";
          resultsDiv.classList.add("visible");
          return;
        }

        if (examScore > examMaxScore) {
          alert("Баллы за экзамен превышают максимальный возможный балл!");
          return;
        }

        // Расчет итоговой успеваемости с учетом экзамена
        const examPerformance = Math.min(examScore / examMaxScore, 1);
        const finalPerformance =
          currentPerformance * (60 / totalWeight) + examPerformance * (40 / totalWeight);
        
        resultMessage += `<br><strong>Итоговая успеваемость с учетом экзамена:</strong> ${(finalPerformance * totalWeight).toFixed(2)}%`;
      }

      resultsDiv.innerHTML = resultMessage;
      resultsDiv.classList.add("visible");
    }, 300);
  });

  document.getElementById("generateWorks").addEventListener("click", () => {
    const worksCount = Math.min(Number(document.getElementById("worksCount").value), 16);
    const worksDiv = document.querySelector(".calculator__works");
    worksDiv.innerHTML = "";

    for (let i = 1; i <= worksCount; i++) {
      const workHTML = `
        <div class="work">
          <h4 class="work__title">Работа ${i}</h4>
          <label>Вес: <input type="number" id="weight${i}" step="0.01" required></label>
          <label>Максимум: <input type="number" id="maxPoints${i}" step="0.01" required></label>
          <label>Получено: <input type="number" id="achievedPoints${i}" step="0.01" required></label>
        </div>`;
      worksDiv.innerHTML += workHTML;
    }

    Array.from(worksDiv.children).forEach((work, index) => {
      setTimeout(() => {
        work.classList.add("visible");
      }, index * 100);
    });
  });
});