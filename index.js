const inquirer = require('inquirer');
const program = require('commander');

console.log('Vue component generator');

const questions = [
  {
    type: 'input',
    name: 'blockName',
    message: 'Название блока',
    validate(answer) {
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
      return !answers.defaultFunctions
    }
  }
];

async function createBlockWithInterface () {
  const data = await inquirer.prompt(questions);
  console.log(data)
}

program
  .version('1.0.0')
  .usage('<name-block ...>')
  .option('-t, --type [type]', 'Тип компонента (block|element) [block]', 'block')
  .option('--no-folder', 'Без папки')
  .action((blocks, commands) => {
    console.log('env', blocks, commands.type, commands.folder)
  })
  .parse(process.argv);

if (!program.args.length) {
  createBlockWithInterface();
}