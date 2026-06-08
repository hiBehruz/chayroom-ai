import { spawn } from 'node:child_process'

const port = process.env.PORT || '62700'
const baseUrl = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: port
  },
  stdio: ['ignore', 'pipe', 'pipe']
})

let output = ''

server.stdout.on('data', (chunk) => {
  output += chunk
})
server.stderr.on('data', (chunk) => {
  output += chunk
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

try {
  let response

  for (let attempt = 0; attempt < 30; attempt++) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited early.\n${output}`)
    }

    try {
      response = await fetch(baseUrl)
      break
    } catch {
      await sleep(500)
    }
  }

  if (!response) {
    throw new Error(`Production server did not start.\n${output}`)
  }

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Production root returned ${response.status}.\n${body}\n${output}`)
  }

  const body = await response.text()
  if (!body.includes('<title>')) {
    throw new Error('Production root did not render an HTML title.')
  }

  console.log(`Production smoke test passed: GET / -> ${response.status}`)
} finally {
  server.kill('SIGTERM')
  await Promise.race([
    new Promise(resolve => server.once('exit', resolve)),
    sleep(5000)
  ])

  if (server.exitCode === null) {
    server.kill('SIGKILL')
  }
}
