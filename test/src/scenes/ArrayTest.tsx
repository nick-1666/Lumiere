import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {waitFor} from '@motion-canvas/core/lib/flow';
import {Array} from '@components/index';
import {createRef} from '@motion-canvas/core/lib/utils';
import {colors} from '@components/Styles';

export default makeScene2D(function* (view) {
  const valueArr = createRef<any[]>();

  view.add(
    <Array
      ref={valueArr}
      values={[1, 2, 3, 4, 5, 6, 7]}
      y={-250}
      name="value"
      suffix={'&Str'}
      suffixColor={colors.red}
    />,
  );

  // yield* valueArr().swapAndHighlight(1, 2);
  yield* waitFor(0.5);
  // yield* valueArr().swapAndHighlight(1, 2);
});
