import { loadLevel } from '../../levels/index.js';
import { startExerciseRuntime } from './exercise-runtime.jsx';
import '../../styles/global.css';
import '../../styles/exercise-frame.css';

startExerciseRuntime(loadLevel);
