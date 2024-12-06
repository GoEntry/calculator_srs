<template>
  <div class="calculator">
    <h1 class="calculator__title">Калькулятор оценок по БРС</h1>
    <form @submit.prevent="calculateResults" class="calculator__form">
      <!-- Выбор типа оценивания -->
      <div class="calculator__input-group">
        <label class="calculator__label">Выберите тип оценивания:</label><br />
        <label class="calculator__radio">
          <input v-model="type" type="radio" value="pass" required /> Зачет
        </label>
        <label class="calculator__radio">
          <input v-model="type" type="radio" value="exam" required /> Экзамен
        </label>
      </div>

      <!-- Количество работ -->
      <div class="calculator__input-group">
        <label class="calculator__label">
          Количество работ (макс. 16):
          <input
            v-model.number="worksCount"
            type="number"
            min="1"
            max="16"
            required
            class="calculator__input"
          />
        </label>
        <button type="button" @click="generateWorks" class="calculator__button">
          Создать поля для работ
        </button>
      </div>

      <!-- Поля для ввода данных о работах -->
      <div id="works" class="calculator__works">
        <div v-for="(work, index) in works" :key="index" class="work visible">
          <h4 class="work__title">Работа {{ index + 1 }}</h4>
          <label
            >Вес:
            <input
              v-model.number="work.weight"
              type="number"
              step="0.01"
              required
            />
          </label>
          <label
            >Максимум:
            <input
              v-model.number="work.maxPoints"
              type="number"
              step="0.01"
              required
            />
          </label>
          <label
            >Получено:
            <input
              v-model.number="work.achievedPoints"
              type="number"
              step="0.01"
              required
            />
          </label>
        </div>
      </div>

      <!-- Поля для экзамена (отображаются только если выбран экзамен) -->
      <div v-if="type === 'exam'" class="calculator__input-group">
        <h3 class="calculator__subtitle">Данные по экзамену:</h3>
        <label class="calculator__label">
          Полученный балл за экзамен:
          <input
            v-model.number="examData.score"
            type="number"
            step="0.01"
            min="0"
            class="calculator__input"
          />
        </label>
        <label class="calculator__label">
          Максимальный балл за экзамен:
          <input
            v-model.number="examData.maxScore"
            type="number"
            step="0.01"
            min="0"
            class="calculator__input"
          />
        </label>
      </div>

      <button type="submit" class="calculator__button">Рассчитать</button>
    </form>

    <!-- Результаты -->
    <div
      id="results"
      class="calculator__results"
      :class="{ visible: resultsVisible }"
      v-html="results"
    ></div>

    <!-- Управление пресетами -->
    <div class="presets">
      <h3>Журнал пресетов</h3>
      <ul v-if="presets.length > 0">
        <li v-for="(preset, index) in presets" :key="index">
          <span>{{ preset.name }}</span>
          <div>
            <button @click="applyPreset(preset)" class="presets__button">
              Применить
            </button>
            <button @click="deletePreset(index)" class="presets__button">
              Удалить
            </button>
          </div>
        </li>
      </ul>
      <p v-else>Сохраненных пресетов нет.</p>
      <button @click="savePreset" class="calculator__button">
        Сохранить текущий пресет
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: "pass",
      worksCount: 1,
      works: [],
      examData: { score: 0, maxScore: 0 },
      results: "",
      resultsVisible: false,
      presets: [],
    };
  },
  methods: {
    loadPresets() {
      this.presets = JSON.parse(localStorage.getItem("presets")) || [];
    },
    savePreset() {
      const presetName = prompt("Введите имя для пресета:");
      if (!presetName) return;

      const newPreset = {
        name: presetName,
        type: this.type,
        works: JSON.parse(JSON.stringify(this.works)),
        examData: { ...this.examData },
      };

      const presets = [...this.presets, newPreset];
      localStorage.setItem("presets", JSON.stringify(presets));
      this.presets = presets;
    },
    applyPreset(preset) {
      this.type = preset.type;
      this.works = JSON.parse(JSON.stringify(preset.works));
      this.examData = { ...preset.examData };
    },
    deletePreset(index) {
      const updatedPresets = this.presets.slice();
      updatedPresets.splice(index, 1);
      this.presets = updatedPresets;
      localStorage.setItem("presets", JSON.stringify(updatedPresets));
    },
    generateWorks() {
      if (this.worksCount < 1 || this.worksCount > 16) return;
      this.works = Array.from({ length: this.worksCount }, () => ({
        weight: 0,
        maxPoints: 0,
        achievedPoints: 0,
      }));
    },
    calculateResults() {
  if (this.works.length === 0) {
    this.results =
      '<span style="color:red;">Ошибка:</span> Не добавлено ни одной работы.';
    this.resultsVisible = true;
    return;
  }

  let totalWeight = 0;
  const currentPerformance = this.works.reduce((sum, work) => {
    if (work.maxPoints > 0 && work.weight > 0) {
      totalWeight += work.weight;
      return sum + (work.achievedPoints / work.maxPoints) * work.weight;
    }
    return sum;
  }, 0);

  if (totalWeight === 0) {
    this.results =
      '<span style="color:red;">Ошибка:</span> Суммарный вес всех работ равен нулю.';
    this.resultsVisible = true;
    return;
  }

  const currentPercentage = (currentPerformance / totalWeight) * 100;

  let resultMessage = `<p><strong>Текущая успеваемость:</strong> ${currentPercentage.toFixed(
    2
  )}%</p>`;

  let finalPerformance = currentPercentage;

  if (this.type === "exam") {
    const { score, maxScore } = this.examData;

    if (maxScore <= 0) {
      this.results =
        '<span style="color:red;">Ошибка:</span> Максимальный балл за экзамен должен быть больше нуля.';
      this.resultsVisible = true;
      return;
    }

    if (score < 0 || score > maxScore) {
      this.results =
        '<span style="color:red;">Ошибка:</span> Полученный балл за экзамен должен быть в пределах от 0 до максимального балла.';
      this.resultsVisible = true;
      return;
    }

    const examPercentage = (score / maxScore) * 100;
    finalPerformance = currentPercentage * 0.6 + examPercentage * 0.4;

    resultMessage += `<p><strong>Итоговая успеваемость:</strong> ${finalPerformance.toFixed(
      2
    )}%</p>`;
  }

  // Оценка и зачёт/незачёт
  if (finalPerformance < 59.1) {
    resultMessage += `<p><strong>Результат:</strong> Незачёт</p>`;
    resultMessage += `<p><strong>Оценка:</strong> 2</p>`;
  } else {
    resultMessage += `<p><strong>Результат:</strong> Зачёт</p>`;
    if (finalPerformance >= 84.1) {
      resultMessage += `<p><strong>Оценка:</strong> 5</p>`;
    } else if (finalPerformance >= 74.1) {
      resultMessage += `<p><strong>Оценка:</strong> 4</p>`;
    } else if (finalPerformance >= 59.1) {
      resultMessage += `<p><strong>Оценка:</strong> 3</p>`;
    }
  }

  this.results = resultMessage;
  this.resultsVisible = true;
},
  },
  mounted() {
    this.loadPresets();
  },
};
</script>