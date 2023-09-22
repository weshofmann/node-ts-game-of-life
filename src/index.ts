import { on } from 'events';
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
  life_will_find_a_way_percent: number
) => CellEvaluator;


const HEIGHT   = process.stdout.rows - 7;
const WIDTH    = process.stdout.columns - 2;
const log_file = './game.log';

const log = fs.createWriteStream(log_file);


let step_count = 0;
let life_will_find_a_way_count = 0;
let alien_abduction_count = 0;
let only_a_flesh_wound_count = 0;


// this will generate a cell_updater function that has a set percentage chance of a cell staying alive
export const cell_updater_generator: CellEvaluatorGenerator = (
  only_a_flesh_wound_percent, 
  alien_abduction_percent,
  life_will_find_a_way_percent
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

    // set a default value of false
    let is_alive: Cell = false;
    const was_alive: Cell = last_board[y][x];
    if (was_alive) { // The cell is currently alive
      // These are the standard rules for Conway's Game of Life

      // Underpopulation: If a live cell has fewer than two live neighbors, it dies.
      if (living_neighbors < 2) is_alive = false;
      // Survival: If a live cell has two or three live neighbors, it survives.
      if (living_neighbors === 2 || living_neighbors === 3) is_alive = true;
      // Overpopulation: If a live cell has more than three live neighbors, it dies.
      if (living_neighbors > 3) is_alive = false;

      // These are some non-standard rules I have added to make the game more interesting
      // and to allow the game to un-stick itself if it becomes stuck.

      // Only a Flesh Wound: If a live cell is marked for death, it has a chance to survive.
      if (is_alive === false && Math.random() < only_a_flesh_wound_percent) {
        is_alive = true;
        log.write(`>>> (${x}, ${y}): Only a flesh wound!\n`);
        only_a_flesh_wound_count++;
      };

      // Alien Abduction: If a live cell has exactly four live neighbors, it 
      // can be abducted (dies).
      if (living_neighbors === 4 && Math.random() < alien_abduction_percent) {
        is_alive = false;
        log.write(`>>> (${x}, ${y}): Alien abduction!\n`);
        alien_abduction_count++;
      };

    } else { // The cell is currently dead
      //Reproduction: If a dead cell has exactly three live neighbors, it becomes a live cell.
      if (living_neighbors === 3) is_alive = true;

      // Life Will Find a Way: If there are at least 2 live neighbors, and the cell has a 
      // chance to come alive.
      if (living_neighbors >= 1 && Math.random() < life_will_find_a_way_percent) {
        is_alive = true;
        log.write(`>>> (${x}, ${y}): Life will find a way!\n`);
        life_will_find_a_way_count++;
      };
    }
    return is_alive;
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
export const render_board = (
  board: Board,
  alien_abduction_percent: number,
  only_a_flesh_wound_percent: number,
  life_will_find_a_way_percent: number
) => {
  // Clear the terminal
  process.stdout.write('\u001b[0;0H');
  
  process.stdout.write(
    `width: ${board[0].length} ` + 
    `height: ${board.length} ` +
    `     STEP: ${step_count}` +
    "\n"
  );
  process.stdout.write("-".repeat(board[0].length + 2) + "\n");

  board.forEach((row, y) => {
    let row_str = '|';
    row.forEach((cell, x) => {
      row_str += cell ? 'o' : ' ';
    });
    row_str += '|';
    process.stdout.write(`${row_str}\n`);
    // process.stdout.write(`\x1b[${y + 3};1H${row_str}\n`);
  });
  process.stdout.write("-".repeat(board[0].length + 2) + "\n");
  process.stdout.write(
    "alien_abduction %      : " + 
    `${(alien_abduction_percent * 100).toFixed(8)}` +
    `     alien_abduction_count     : ${alien_abduction_count}` +
    "  \n"
  );
  process.stdout.write(
    "only_a_flesh_wound %   : " +
    `${(only_a_flesh_wound_percent * 100).toFixed(8)}` +
    `     only_a_flesh_wound_count  : ${only_a_flesh_wound_count}` +
    "  \n"
  );
  process.stdout.write(
    "life_will_find_a_way % : " + 
    `${(life_will_find_a_way_percent * 100).toFixed(8)}` +
    `     life_will_find_a_way_count: ${life_will_find_a_way_count}` +
    "  \n"
  );
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

  let prev_board_count = 10;
  let prev_boards: Board[] = [];

  let decrease_randomness = false;

  let alien_abduction_percent = 0;
  let alien_abduction_percent_increment = 0.00001;
  let only_a_flesh_wound_percent = 0;
  let only_a_flesh_wound_percent_increment = 0.00005;
  let life_will_find_a_way_percent = 0;
  let life_will_find_a_way_percent_increment = 0.000001;

  let percent_decrement_scale = 0.25;

  let cell_updater: CellEvaluator = cell_updater_generator(
    only_a_flesh_wound_percent, 
    alien_abduction_percent,
    life_will_find_a_way_percent
  ); 

  log.write("Starting game...\n");

  // clear the terminal/screen
  process.stdout.write('\u001b[2J\u001b[0;0H');

  const loop = setInterval(() => {
    render_board(
      board, 
      alien_abduction_percent, 
      only_a_flesh_wound_percent, 
      life_will_find_a_way_percent
    );

    // compare the currrent board with our previous boards
    if (prev_boards.some((prev_board) => are_boards_equal(board, prev_board))) {
      only_a_flesh_wound_percent += only_a_flesh_wound_percent_increment;
      alien_abduction_percent += alien_abduction_percent_increment;
      life_will_find_a_way_percent += life_will_find_a_way_percent_increment;
      cell_updater = cell_updater_generator(
        only_a_flesh_wound_percent,
        alien_abduction_percent,
        life_will_find_a_way_percent
      );
      log.write(`+++ INCREASING RANDOMNESS` + 
        `  only_a_flesh_wound: ${only_a_flesh_wound_percent.toFixed(8)}` + 
        `  alien_abduction: ${alien_abduction_percent.toFixed(8)}` +
        `  life_will_find_a_way: ${life_will_find_a_way_percent.toFixed(8)}\n`
      );
    } else {
      if (only_a_flesh_wound_percent > 0) {
        let decrement: number = only_a_flesh_wound_percent_increment * percent_decrement_scale;
        only_a_flesh_wound_percent = Math.max(0, only_a_flesh_wound_percent - decrement);
        decrease_randomness = true;
      };
      if (alien_abduction_percent > 0) {
        let decrement: number = alien_abduction_percent_increment * percent_decrement_scale;
        alien_abduction_percent = Math.max(0, alien_abduction_percent - decrement);
        decrease_randomness = true;
      };
      if (life_will_find_a_way_percent > 0) {
        let decrement: number = life_will_find_a_way_percent_increment * percent_decrement_scale;
        life_will_find_a_way_percent = Math.max(0, life_will_find_a_way_percent - decrement);
        decrease_randomness = true;
      };
      if (decrease_randomness) {
        cell_updater = cell_updater_generator(
          only_a_flesh_wound_percent,
          alien_abduction_percent,
          life_will_find_a_way_percent
        );
        log.write(`--- DECREASING RANDOMNESS` + 
          `  only_a_flesh_wound: ${only_a_flesh_wound_percent.toFixed(8)}` + 
          `  alien_abduction: ${alien_abduction_percent.toFixed(8)}` +
          `  life_will_find_a_way: ${life_will_find_a_way_percent.toFixed(8)}\n`
        );
        decrease_randomness = false;
      };
    }

    // update previous boards for next iteration
    if (prev_boards.length >= prev_board_count) prev_boards.shift();
    prev_boards.push(board);

    // now generate new board
    board = update_board(WIDTH, HEIGHT, cell_updater, board);
    
    // increment our step count
    step_count++;
  }, 150);
};


// main()
start_game();