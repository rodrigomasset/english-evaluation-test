import fs from 'fs'
import path from 'path'
import { query } from '../lib/db'

async function run(){
  const file = path.join(process.cwd(), 'data', 'questions.full.json')
  const raw = fs.readFileSync(file, 'utf8')
  const items = JSON.parse(raw)
  for (const q of items){
    await query(
      `INSERT INTO questions(level,prompt,options,correct_index,active) VALUES($1,$2,$3,$4,true)`,
      [q.level, q.prompt, JSON.stringify(q.options), q.correct_index]
    )
  }
  console.log(`Importadas ${items.length} questões.`)
}
run().catch(e=>{ console.error(e); process.exit(1) })
