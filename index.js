const inquirer = require('inquirer');
const program = require('commander');
const changeCase = require('change-case');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const fsStat = promisify(fs.stat);
const fsMkDir = promisify(fs.mkdir);
const fsWriteFile = promisify(fs.writeFile);

console.log('Vue component generator');



const questions = [
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
      return !answers.defaultFunctions
    }
  }
];

async function createBlockWithInterface() {
  const data = await inquirer.prompt(questions);
  console.log(data)
}

program
  .version('1.0.0')
  .usage('<name-block ...>')
  .arguments('[name-block...]')
  .option('-t, --type [type]', 'Тип компонента (block|element) [block]', 'block')
  .option('--no-folder', 'Без папки')
  .action((blocks, commands) => {
    for (let block of blocks) {
      if (!/^(\d|\w|-)+$/.test(block)) {
        console.error('Введите имя в правильном формате');
        return false;
      }
    }
    console.log('env', blocks, commands.type, commands.folder)
  })
  .parse(process.argv);

if (!program.args.length) {
  createBlockWithInterface();
}

const folders = {
  page: path.join(__dirname, 'src/pages'),
  block: path.join(__dirname, 'src/components'),
  element: path.join(__dirname, 'src/elements')
};

const fileSources = {
  vue: blockName => `<template>
  <div class="${changeCase.paramCase(blockName)}"></div>
</template>

<script>
const props = [];

const data = function () {
  return {

  };
};

const computed = {};

const methods = {};

const created = function () {};

const mounted = function () {};

const components = {};

export default {
  name: '${changeCase.paramCase(blockName)}',
  props,
  data,
  computed,
  methods,
  created,
  mounted,
  components
};
</script>

<style lang="scss">
.${changeCase.paramCase(blockName)} {
  display: block;
}
</style>

`
};



class makeBlock {
  constructor(options) {
    this.options = options;
  }

  async directoryOrFileExist(blockPath, blockName) {
    try {
      await fsStat(blockPath)
      return true;
    } catch (err) {
      throw `Error >>> Данный файл или директория уже существует ${blockName || blockPath}`
    }
  }

  async createDir(dirPath) {
    try {
      await fsMkDir(dirPath)
      return true;
    } catch (err) {
      throw `Error >>> Данный файл уже существует ${dirPath}`
    }
  }

  async createFiles(blockPath, blockName) {
    const files = [];

    Object.keys(fileSources).forEach(ext => {
      const fileSource = fileSources[ext](blockName);
      const filename = `${blockName}.${ext}`;
      const filePath = path.join(blockPath, filename);

      files.push(fsWriteFile(filePath, fileSource, 'utf-8'))
    })

    try {
      return await Promise.all(files);
    } catch (err) {
      console.error(`Error >>> Данный файл уже существует`);
      throw err;
    }
  }

  async makeBlock(blockName) {
    let blockPath = path.join(folders[this.options.typeBlock])
    if (this.options.createWithDir) {
      blockPath = path.join(folders[this.options.typeBlock], blockName)
    }

    await this.directoryOrFileExist(blockPath)
    await this.createDir(blockPath)
    await this.createFiles(blockPath, blockName)
  }

  create() {
    const blocks = this.options.blockName

    if (Array.from(blocks)) {
      const files = blocks.map(name => this.makeBlock(name));
      return Promise.all(files);
    }

    return this.makeBlock(blocks)
  }
}