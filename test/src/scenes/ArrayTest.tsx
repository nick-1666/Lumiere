import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all, waitFor} from '@motion-canvas/core/lib/flow';
import {Array} from '@components/index';
import {createRef, debug} from '@motion-canvas/core/lib/utils';
import {colors} from '@components/Styles';

export default makeScene2D(function* (view) {
  const valueArr = createRef<any[]>();

  view.add(
    <Array
      ref={valueArr}
      values={[1, 2, 3, 4, 5, 6, 7]}
      y={-250}
      name="Intager Stack"
      suffix={'i8[]'}
      suffixColor={colors.green}
    />,
  );

  // yield* valueArr().swapAndHighlight(1, 2);
  yield* waitFor(1);
  yield* valueArr().chainPop(5);

  debug(valueArr().values());

  // yield* waitFor(0.2);

  // yield* valueArr().push(4);
  // debug(valueArr().values());

  // yield* waitFor(1);

  // yield* valueArr().pop();
  // debug(valueArr().values());

  // yield* waitFor(0.2);

  // yield* valueArr().pop();
  // debug(valueArr().values());

  // yield* waitFor(1);
  // yield* valueArr().swapAndHighlight(1, 2);
});
