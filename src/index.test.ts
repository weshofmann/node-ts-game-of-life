import { Cell, Row, Board, initialize_cell, initialize_row, initialize_board } from './main'; // import your functions

describe('Game of Life Initialization', () => {

  test('initialize_cell should return a boolean', () => {
    expect(typeof initialize_cell()).toBe('boolean');
  });

  test('initialize_row should return an array of given width', () => {
    const width = 5;
    const row = initialize_row(width);
    expect(row.length).toBe(width);
    // Check if all elements are boolean
    expect(row.every((cell: Cell) => typeof cell === 'boolean')).toBe(true);
  });

  test('initialize_board should return a 2D array of given dimensions', () => {
    const width = 5;
    const height = 5;
    const board = initialize_board(width, height);
    expect(board.length).toBe(height);
    expect(board.every((row: Row) => row.length === width)).toBe(true);
    // Check if all elements are arrays containing booleans
    expect(board.every((row: Row) => row.every((cell: Cell) => typeof cell === 'boolean'))).toBe(true);
  });

});
