const path = require('path')
const fs = require('fs');
const loader = require('./functions/loader.js')
const searcher = require('./functions/searcher')
const moduleErr = require('../utils/moduleErr.js')
const Stament = require('./Stament.js')

class DatabaseManager {
  constructor(opts = {folder: false, file: false, memory: true}, ...path) {
    const loaded = loader(opts, path)//Load db files. Default collecting files

    this.data = loaded.memory ?? null;
    this.folders = loaded.folders ?? null;
    this.files = loaded.files ?? null;

    if (opts.folder && opts.file) opts = {file: true, memory: opts.memory}//settings...
    let getTypes = Object.values(opts)

    this.typesDB = Object.fromEntries(Object.entries(opts).filter(([key, value]) => value))//sí, lo aprendí de stackoverflow, y que pasa?
    this.db;
  }

  addFiles(...files) {
    let newFiles = loader({file: true}, files)?.files

    if (!this.files) this.files = {}
    this.files = Object.assign(this.files, newFiles)
  }

  addFolders(...folders) {
    let newFolders = loader({folder: true}, folders)?.folders

    if (!this.folders) this.folders = {}
    this.folders = Object.assign(this.folders, newFolders)
  }

  createDB(pathway, name) {
    if (!pathway) throw new moduleErr('Añade la ruta donde crear una nueva base de datos')
    if (!name) name = ''
    pathway = path.resolve(pathway)

    try {
      fs.readdirSync(pathway)
    } catch(e) {
      throw new moduleErr(`A ocurrido un error. El error más común es una ruta mal puesta, más información:\n${e.message}`)
    }

    fs.writeFile(pathway+'\\'[0]+name+'.sqlite', '', function(err) {
      if (err) throw new moduleErr(`A ocurrido un error, más información:\n${err.message}`)
    });

    return {sucess: true, pathway: path.resolve(pathway+'/'+name+'.sqlite')}
  }


  //BASE DE DATOS
  set src(name) {
    if (!name) throw new moduleErr('Añade el nombre de la base de datos a usar')
    if (name.toLowerCase() == ':memory:') return this.db = this.data

    const searched = searcher(name, ...[this.folders, this.files])
    if (!searched) throw new moduleErr(`No se ha encontrado la base de datos ${name}`)
    else this.db = searched
  }

  get(object) {
    let db = this.db
    const myStament = new Stament(object)
    let stament = myStament.create('GET_DATA')

    if (!db) throw new moduleErr('Añade una base de datos sobre la que actuar con "db.src = dbName"')
    let myData = myStament.parseDB((db.prepare(stament.stament).all())).values()

    let raw = object[1]
    let rawToSimplify = myStament.simplifyData(raw, [])
    console.log(rawToSimplify.simplify)
  }

  all(table) {
  let db = this.db
  const myStament = new Stament(table)
  let stament = myStament.create('GET_DATA')

  if (!db) throw new moduleErr('Añade una base de datos sobre la que actuar con "db.src = dbName"')
  let myData = db.prepare(stament.stament).all()

  return myStament.parseDB(myData)
}

  createTables(...object) {
    let db = this.db

    if (!db) throw new moduleErr('Añade una base de datos sobre la que actuar')
    if (object.length < 1) throw new moduleErr('Añade tablas para añadir a la base de datos')

    object.forEach(item => {
      if (!Array.isArray(item)) throw new moduleErr('Las tablas se representan en Arrays')
      if (item.length < 2) throw new moduleErr('Datos de la tabla incompletos')

      const myStament = new Stament(item).create('NEW_TABLE')
      let data = db.prepare(myStament).run()
    });
  }

  setData(...object) {
    let db = this.db

    if (!db) throw new moduleErr('Añade una base de datos sobre la que actuar')
    if (object.length < 1) throw new moduleErr('Añade datos para añadir a la base de datos')
    const defult = myDB.prepare(`PRAGMA table_info(Test)`).get()[0].dflt_value

    object.forEach(item => {
      if (!Array.isArray(item)) throw new moduleErr('Los datos se representan en Arrays')
      if (item.length < 2) throw new moduleErr('Datos incompletos')

      const myStament = new Stament(item).create('ADD_DATA')
      db.prepare(myStament).run()
    });
  }
}

module.exports = DatabaseManager
