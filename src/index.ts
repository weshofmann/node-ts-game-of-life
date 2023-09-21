import * as fs from 'fs';

export type Cell = boolean;  // true for alive, false for dead
export type Row = Cell[];
export type Board = Cell[][];

export type CellEvaluator = (
  x: number,
  y: number,
  last_board: Board
) => Cell;

export type CellEvaluatorGenerator = (
  only_a_flesh_wound_percent: number,
  alien_abduction_percent: number,
) => CellEvaluator;


const HEIGHT   = process.stdout.rows - 3;
const WIDTH    = process.stdout.columns - 2;
const log_file = './game.log';

const log = fs.createWriteStream(log_file);

// this will generate a cell_updater function that has a set percentage chance of a cell staying alive
export const cell_updater_generator: CellEvaluatorGenerator = (
  only_a_flesh_wound_percent, 
  alien_abduction_percent
) => {
  // This is a CellEvaluator function that implement's the rules of Conway's Game of Life. 
  // It assigns a boolan value for a given cell based on the state of the cell's neighbors.
  const cell_updater: CellEvaluator = (x, y, last_board) => {
    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];
    const living_neighbors = neighbors.reduce((count, [dy, dx]) => {
      const nx = x + dx, ny = y + dy;
      return count + (last_board[ny]?.[nx] ? 1 : 0);
    }, 0);
    return (
      (
        (living_neighbors === 3) || 
        (living_neighbors === 2 && last_board[y][x]) ||
        (Math.random() < only_a_flesh_wound_percent && last_board[y][x])    // allow the possibility for a cell to randomly stay alive
      ) && (Math.random() > alien_abduction_percent)
    );
  };
  return cell_updater;
};


// This is a special "initializer" CellEvaluator function.  Essentially it just assigns 
// a random boolan value for a given cell in the board.  It ignores the last_board parameter.
export const cell_initializer: CellEvaluator = (x, y, last_board) => {
  return Math.random() < 0.5;
};


// tail-recursive implementation of row update, even though TS doesn't optimize for tail-recursion.
// why?  because tail-recursion is awesome.  'nuff said. 
export const update_row = (
  width         : number,
  height        : number,
  cell_evaluator: CellEvaluator,
  last_board    : Board,
  row           : Row = []
): Row => {
  if (width <= 0) return row;
  // since we are populating this array essentially backwards through this tail-recursive implementation,
  // figuring out our x and y coordinates is a little tricky.  We can't just use `width` and `height` as
  // the x and y coordinates, because those are the dimensions of the board, not the coordinates of the
  // cell we are evaluating.  So we have to do a little math to figure out the coordinates of the cell
  // we are evaluating.
  const x = WIDTH - width;
  const y = HEIGHT - height;
  const new_row = row.concat(cell_evaluator(x, y, last_board));
  return update_row(width - 1, height, cell_evaluator, last_board, new_row);
};


// This function will update the board recursively, of course.  In fact, also tail-recursively!
// Note that this function can also be used to initialize an empty board, based on the following:
//   the `cell_evaluator` should be a function that ignores the `last_board` parameter and
//   returns a random boolean value.
export const update_board = (
  width         : number,
  height        : number,
  cell_evaluator: CellEvaluator,
  last_board    : Board = [],
  curr_board    : Board = []
): Board => {
  if (height <= 0) return curr_board;
  const new_board = curr_board.concat([update_row(width, height, cell_evaluator, last_board)]);
  return update_board(width, height - 1, cell_evaluator, last_board, new_board);
};


// This function renders the board to the terminal.  It is not tail-recursive, but it doesn't need to be.
export const render_board = (board: Board) => {
  // Clear the terminal
  process.stdout.write('\u001b[0;0H');
  
  process.stdout.write(
    `width: ${board[0].length}, height: ${board.length}\n` + "-".repeat(board[0].length + 2) + "\n"
  );

  board.forEach((row, y) => {
    let row_str = '|';
    row.forEach((cell, x) => {
      row_str += cell ? 'o' : ' ';
    });
    row_str += '|';
    process.stdout.write(`${row_str}\n`);
    // process.stdout.write(`\x1b[${y + 3};1H${row_str}\n`);
  });
  process.stdout.write("-".repeat(board[0].length + 2));
};


// Function to compare two boards for equality
export const are_boards_equal = (board1: Board, board2: Board): boolean => {
  if (board1.length !== board2.length) return false;
  
  for (let i = 0; i < board1.length; i++) {
      if (board1[i].length !== board2[i].length) return false;
      
      for (let j = 0; j < board1[i].length; j++) {
          if (board1[i][j] !== board2[i][j]) return false;
      }
  }
  return true;
};


// This function is our main game loop.  It will initialize the board, and then update and render
export const start_game = () => {
  let board: Board = update_board(WIDTH, HEIGHT, cell_initializer);

  let prev_board_count = 6;
  let prev_boards: Board[] = [];

  let alien_abduction_percent = 0;
  let only_a_flesh_wound_percent = 0;

  let cell_updater: CellEvaluator = cell_updater_generator(
    only_a_flesh_wound_percent, alien_abduction_percent
  ); 

  // clear the terminal/screen
  process.stdout.write('\u001b[2J\u001b[0;0H');

  const loop = setInterval(() => {
    render_board(board);

    // compare the currrent board with our previous boards
    if (prev_boards.some((prev_board) => are_boards_equal(board, prev_board))) {
      only_a_flesh_wound_percent += 0.00001;
      alien_abduction_percent += 0.0000001;
      cell_updater = cell_updater_generator(
        only_a_flesh_wound_percent,
        alien_abduction_percent
      );
      log.write(`Board was static for ${prev_board_count} steps.` + 
        `only_a_flesh_wound_percent: ${only_a_flesh_wound_percent}` + 
        `alien_abduction_percent: ${alien_abduction_percent}\n`
      );
    } else {
      if (only_a_flesh_wound_percent > 0) {
        only_a_flesh_wound_percent = 0;
        cell_updater = cell_updater_generator(
          only_a_flesh_wound_percent,
          alien_abduction_percent
        );
        log.write(`We are now no longer stuck.  Resetting only_a_flesh_wound_percent and alien_abduction_percent\n`);
      }
    }

    // update previous boards for next iteration
    if (prev_boards.length >= prev_board_count) prev_boards.shift();
    prev_boards.push(board);

    // now generate new board
    board = update_board(WIDTH, HEIGHT, cell_updater, board);
  }, 50);
};


// main()
start_game();