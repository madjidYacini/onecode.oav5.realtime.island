import kleur from 'kleur'
import moment from 'moment'

export function argv() {
  return process.argv.slice(2)
}

export function mlog(str, c = 'magenta', withNewLine = true) {
  const available_colors = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
  ]

  if (!available_colors.includes(c)) {
    c = 'magenta'
  }

  const display = kleur[c](`${moment().format()} - ${str}`)

  if (withNewLine) {
    console.log(display)
  } else {
    process.stdout.write(display)
  }
}
