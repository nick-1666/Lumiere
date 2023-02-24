import {makeProject} from '@motion-canvas/core';
import ArrayTest from './scenes/ArrayTest?scene';
import MatrixTest from './scenes/MatrixTest?scene';

export default makeProject({
  scenes: [ArrayTest, MatrixTest],
  background: '#141414',
});
