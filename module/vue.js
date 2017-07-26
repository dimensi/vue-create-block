const changeCase = require('change-case');

const generateFunctions = (arrFunc) => {
  if (Array.isArray(arrFunc)) {
    return arrFunc.map(name => baseFunctions[name]).join('\n\n');
  }
  if (arrFunc === 'all') {
    return Object.keys(baseFunctions).map(name => baseFunctions[name]).join('\n\n');
  }
};

const generateExports = (arrFunc) => {
  if (Array.isArray(arrFunc)) {
    return arrFunc.join(',\n  ');
  }
  if (arrFunc === 'all') {
    return Object.keys(baseFunctions).map(name => name).join(',\n  ');
  }
};

export default {
  name: 'Component generator',
  description: 'Генератор файлов для vue компонентов',
  options: {
    console: [],
    interface: [
      {
        type: 'input',
        name: 'blockName',
        message: 'Название блока',
        validate(answer) {

          if (!/^(\d|\w|-)+$/.test(answer)) {
            return 'Введите имя в правильном формате';
          }

          if (!answer.length) {
            return 'Нужно указать имя блока';
          }

          return true;
        }
      },
      {
        type: 'list',
        name: 'typeBlock',
        message: 'Тип блока?',
        choices: [{
          name: 'Элемент',
          value: 'element'
        }, {
          name: 'Компонент',
          value: 'block'
        }]
      },
      {
        type: 'confirm',
        name: 'createWithDir',
        message: 'Создавать с папкой?',
        default: true
      },
      {
        type: 'confirm',
        name: 'defaultFunctions',
        message: 'Функции по умолчанию?',
        default: true
      },
      {
        type: 'checkbox',
        name: 'functions',
        message: 'Выберите функции',
        choices: [
          {
            name: 'props'
          },
          {
            name: 'data'
          },
          {
            name: 'computed'
          },
          {
            name: 'methods'
          },
          {
            name: 'watch'
          },
          {
            name: 'created'
          },
          {
            name: 'mounted'
          },
          {
            name: 'components'
          }
        ],
        when(answers) {
          return !answers.defaultFunctions;
        }
      }
    ],
    module: {},
    paths: {
      page: path.join(__dirname, 'src/pages'),
      block: path.join(__dirname, 'src/components'),
      element: path.join(__dirname, 'src/elements')
    }
  },
  fileSources: [
    {
      ext: 'vue',
      content: (blockname) => `<template>
  <div class="${changeCase.paramCase(blockName)}"></div>
</template>

<script>
${generateFunctions(arrFunc)}

export default {
  name: '${changeCase.paramCase(blockName)}',
  ${generateExports(arrFunc)}
};
</script>

<style lang="scss">
.${changeCase.paramCase(blockName)} {
  display: block;
}
</style>

`
    }
  ],
  textForGenerate: {
    props: 'const props = [];',
    data: `const data = function () {
  return {

  };
};`,
    computed: 'const computed = {};',
    methods: 'const methods = {};',
    created: 'const created = function () {};',
    mounted: 'const mounted = function () {};',
    components: 'const components = {};'
  }
}