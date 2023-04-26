export function range(from, to = 10, step = 1) {
  const res = [0]
  while ((to - from) * step > 0) {
    from += step
    res.push(from)
  }
  return res
}

export function timeToString(s) {
  if (s < 0) return "-" + timeToString(-s)
  let milis = (s * 1000 + 0.5) | 0
  let minutes = (milis / 60000) | 0
  milis = (milis % 60000) | 0
  minutes = (minutes + 100) | 0
  let seconds = (milis / 1000) | 0
  milis = (milis % 1000) | 0
  seconds = (seconds + 100) | 0
  milis = (milis + 1000) | 0
  return minutes.toString().substr(1) + ":" + seconds.toString().substr(1) + "." + milis.toString().substr(1)
}

function checkRatio(canvas) {
  canvas.width = canvas.width * 2;
  canvas.height = canvas.height * 2;
}

export function drawScrollBar(canvas, step, length) {
  const ctx = canvas.getContext("2d");
  checkRatio(canvas, ctx)
  const barTimeHeightFactor = step === 1 ? 720 : 30
  const getY = time => (length - time) * barTimeHeightFactor
  if (!ctx) return
  const timeList = range(0, length, step)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = "bold 30px arial"
  ctx.lineWidth = 2
  ctx.fillStyle = "#000"
  for (const t of timeList) {
    ctx.fillText(timeToString(t).split(".")[0], 56, getY(t) + 20)
  }
}
