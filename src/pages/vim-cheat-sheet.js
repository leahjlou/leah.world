import React from 'react'

export default class VimCheatSheet extends React.Component {
  render() {
    return (
      <div>
        <h1>vim/tmux cheat sheet</h1>
        <p>An extremely non-exhaustive cheat sheet of helpful commands to get started with tmux and vim.</p>
        <h3>vim</h3>
        <p><b>Modes</b></p>
        <ul>
          <li><b>i</b>: insert mode</li>
          <li><b>v</b>: visual (highlight) mode</li>
          <li><b>esc</b>: normal mode</li>
        </ul>
        <p><b>Getting around</b></p>
        <ul>
          <li><b>hjkl</b>: left/down/up/right</li>
          <li><b>A</b>: insert at end of line</li>
          <li><b>$</b>: jump to end of line</li>
          <li><b>0</b>: jump to beginning of line</li>
          <li><b>gg</b>: jump to beginning of file</li>
          <li><b>G</b>: jump to end of file</li>
          <li><b>ctrl+d</b>: scroll down</li>
          <li><b>ctrl+u</b>: scroll up</li>
        </ul>
        <p><b>Inserting</b></p>
        <ul>
          <li><b>I</b>: insert at beginning of line</li>
          <li><b>A</b>: insert at end of line</li>
          <li><b>o</b>: insert on a newline after the current line</li>
          <li><b>O</b>: insert on a newline before the current line</li>
        </ul>
        <p><b>Selecting/highlighting/"visual" mode</b></p>
        <ul>
          <li><b>V</b>: select whole line</li>
          <li><b>viw</b>: highlight word</li>
          <li><b>vi{'{'}</b>: highlight everything inside of {'{}'}</li>
          <li><b>vi"</b>: highlight everything inside of ", etc</li>
        </ul>
        <p><b>Window</b></p>
        <ul>
          <li><b>vv</b>: vertical split</li>
          <li><b>ss</b>: horizontal split</li>
        </ul>
        <p><b>Undo/redo</b></p>
        <ul>
          <li><b>u</b>: undo</li>
          <li><b>ctrl+r</b>: redo</li>
        </ul>
        <p><b>Copy/paste</b></p>
        <ul>
          <li><b>y</b>: yank/copy</li>
          <li><b>p</b>: paste</li>
          <li><b>x</b>: cut</li>
          <li><b>yy</b>: copy current line</li>
          <li><b>dd</b>: cut current line</li>
          <li>paste from computer clipboard: <b>"</b> and then <b>*</b> to select the right registry, <b>p</b> to paste</li>
        </ul>
        <p><b>Indentation</b></p>
        <ul>
          <li><b>{'>'}</b>: indent selection</li>
          <li><b>{'<'}</b>: outdent selection</li>
          <li><b>{'>> or <<'}</b>: indent/outdent current line</li>
          <li><b>{'='}</b>: auto-fix indentation of selection</li>
        </ul>
        <p><b>Commenting</b></p>
        <ul>
          <li><b>gcc</b>: comment/uncomment current line</li>
          <li><b>gc</b>: comment/uncomment highlighted text</li>
        </ul>
        <p><b>Other</b></p>
        <ul>
          <li><b>/</b>: find inside file</li>
          <li><b>r</b>: replace character with next typed character</li>
          <li><b>:edit</b>: reload file (if a change was made externally)</li>
          <li><b>,”</b>: surround current word with “”</li>
          <li><b>,{'{'}</b>: surround current word with {'{}'}</li>
          <li><b>.</b>: repeat last command</li>
          <li><b>,ci</b>: remove something inside of a contained space</li>
          <li><b>c</b>: when in visual mode, deletes and puts you in insert mode</li>
          <li><b>{'%'}</b>: toggle between opening/closing {}, “”, etc</li>
          <li><b>:s/foo/bar/g</b>: replace foo with bar in highlighted text</li>
        </ul>
        <p><b>Nerdtree</b> (requires the Nerdtree plugin)</p>
        <ul>
          <li><b>ctrl+\</b>: open tree / jump to file in tree</li>
          <li><b>r</b>: refresh directory</li>
          <li><b>R:</b>: refresh root</li>
          <li><b>m:</b>: open menu (to create new files, delete, move, etc)</li>
        </ul>
        <h3>tmux</h3>
        <p>Prefix all commands with <b>ctrl+b</b> (or whatever you've mapped your tmux prefix as, mine is <b>ctrl+a</b>)</p>
        <ul>
          <li><b>c</b>: new session (tab)</li>
          <li><b>,</b>: rename session (tab)</li>
          <li><b>s</b>: split tab horizontally</li>
          <li><b>v</b>: split tab vertically</li>
          <li><b>x</b>: kill pane/window</li>
          <li><b>n</b>: jump to next session</li>
          <li><b>H/J/K/L</b>: resize pane in different directions</li>
          <li><b>{'{ and }'}</b>: switch panes</li>
          <li><b>[</b>: enter scroll mode</li>
          <li><b>q: qu</b>: enit scroll mode</li>
          <li><b>z: to</b>: enggle making pane fullscreen</li>
        </ul>
      </div>
    )
  }
}
