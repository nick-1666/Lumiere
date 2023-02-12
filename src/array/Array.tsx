import {
  Layout,
  Node,
  Rect,
  RectProps,
  Text,
} from '@motion-canvas/2d/lib/components';
import {initial, signal} from '@motion-canvas/2d/lib/decorators';
import {all} from '@motion-canvas/core/lib/flow';
import {
  createSignal,
  SignalValue,
  SimpleSignal,
} from '@motion-canvas/core/lib/signals';
import {ColorSignal, PossibleColor} from '@motion-canvas/core/lib/types';
import {createRef, makeRef, range} from '@motion-canvas/core/lib/utils';
import {Colors, WhiteLabel} from '@components/Styles';
import {ArrayEntry, HighlightProps, HighlightSubject} from './ArrayEntry';

/**
 * Used for setting the label
 * of each value in the array
 */
export interface LabeledArray {
  [key: string]: string | number;
}

export const isLabeledArray = (
  checkObj: number[] | string[] | LabeledArray,
): checkObj is LabeledArray => {
  if ((checkObj as LabeledArray) !== undefined) {
    return true;
  }
  return false;
};

export function toLabeledArray(
  a: number[] | string[] | LabeledArray,
): LabeledArray {
  if (isLabeledArray(a)) return a;

  let labeledArray: LabeledArray;
  for (let i = 0; i < a.length; i++) {
    labeledArray[i] = a[i];
  }

  return labeledArray;
}
/**
 * `Top` - Renders the name on the top of the array
 *
 * `Bottom` - Renders the name on the bottom of the array
 *
 * @remarks note: the name will be centred horizontally
 */
export enum Align {
  Top,
  Botom,
}
/**
 * @param values The values of the array
 * @param name The name of the array
 * @param suffix The suffix of the name
 * @param suffixColor Used for coloring the
 * suffix
 * @param align The alignment of the array's name
 *
 * @see {@link LabeledArray}, {@link Align}
 *
 * @remarks suffix is usually used
 * to show the type of the array
 * such as the name `intArr int[]`
 * where `int[]` is the suffix.
 */
export interface ArrayProps extends RectProps {
  values: SignalValue<number[] | string[] | LabeledArray>;
  name?: SignalValue<string>;
  suffix?: SignalValue<string>;
  suffixColor?: SignalValue<PossibleColor>;
  align?: SignalValue<Align>;
}

export class Array extends Rect {
  @signal()
  public declare readonly values: SimpleSignal<
    number[] | string[] | LabeledArray,
    this
  >;

  @initial('array')
  @signal()
  public declare readonly name: SimpleSignal<string, this>;

  @initial('[]')
  @signal()
  public declare readonly suffix: SimpleSignal<string, this>;

  @initial(Colors.blue)
  @signal()
  public declare readonly suffixColor: ColorSignal<this>;

  @initial(Align.Top)
  @signal()
  public declare readonly align: SimpleSignal<Align, this>;

  @initial([])
  @signal()
  public boxArray = createSignal<ArrayEntry[], this>([]);

  private pool = (max: number) =>
    range(max).map(i => {
      const v = toLabeledArray(this.values());
      const entries = Object.entries(v);

      return (
        <ArrayEntry
          ref={makeRef(this.boxArray(), i)}
          x={-((entries.length * 80) / 2) + i * 80 + 40}
          index={i}
          value={entries[i][1]}
          label={entries[i][0]}
        />
      );
    });
  /**
   * An array component used for
   * containing characters and
   * numerical values.
   *
   * @see {@link ArrayProps}
   */
  public constructor(props?: ArrayProps) {
    super({
      size: () => [
        Object.keys(toLabeledArray(this.values())).length * 80 + 20,
        100,
      ],
      spawner: () =>
        this.pool(Object.keys(toLabeledArray(this.values())).length),
      smoothCorners: true,
      cornerSharpness: 0.65,
      radius: 20,
      fill: Colors.surface,
      ...props,
    });

    this.add(
      <Layout
        direction="row"
        gap={10}
        layout
        offsetY={this.align() === Align.Top ? 1 : -1}
        y={
          this.align() === Align.Top ? this.size().y - 45 : -this.size().y + 65
        }
      >
        <Text {...WhiteLabel} text={this.name()} />
        <Text {...WhiteLabel} fill={this.suffixColor()} text={this.suffix()} />
      </Layout>,
    );
  }
  /**
   * Highlight a node in the array
   * @param Index The index of the node
   * that will be highlighted
   *
   * @see {@link HighlightProps}
   */
  public *highlight(Index: number, props: HighlightProps) {
    yield* this.boxArray()[Index].highlight(props);
  }

  /**
   * Highlight just the border of a node
   * in the array.
   * @param Index The index of the node
   * who's border will be highlighted
   * @param Color The color to highlight in
   * @param Duration The duration (in seconds)
   * of the highlight animation
   */
  public *highlightBorder(
    Index: number,
    Color: PossibleColor = Colors.background,
    Duration = 0.2,
  ) {
    yield* this.boxArray()[Index].highlightBorder(Color, Duration);
  }

  /**
   * Animate the swap of two nodes in the
   * array component.
   *
   * @param index1 The first node's index
   * @param index2 The second node's index
   * @param Duration The duration (in seconds) of the swap animation
   */
  public *swap(index1: number, index2: number, Duration = 0.2) {
    const temp = createRef<Node>();

    this.add(<Node ref={temp} />);
    this.boxArray()[index1].children()[0].children()[1].reparent(temp());
    this.boxArray()[index2].children()[0].children()[1].reparent(temp());

    yield* all(
      this.boxArray()[index1].position(
        this.boxArray()[index2].position(),
        Duration,
      ),
      this.boxArray()[index2].position(
        this.boxArray()[index1].position(),
        Duration,
      ),
    );
    const arr = toLabeledArray(this.values());
    const entries = Object.entries(arr);

    //switch entry values
    [arr[entries[index1][0]], arr[entries[index2][0]]] = [
      arr[entries[index2][1]],
      arr[entries[index1][1]],
    ];

    temp().children()[0].reparent(this.boxArray()[index2].children()[0]);
    temp().children()[0].reparent(this.boxArray()[index1].children()[0]);
    [this.boxArray()[index1], this.boxArray()[index2]] = [
      this.boxArray()[index2],
      this.boxArray()[index1],
    ];
    temp().remove();
  }

  /**
   * Swap two node's positions and highlight them before
   * doing so
   *
   * @param index1 The first node's index
   * @param index2 The Second node's index
   * @param props {@link HighlightProps}
   * @param swapDuration The animation duration (in seconds) of
   * _just_ the swap and _not_ the highlight animation period.
   * @param segment If true, highlight each node in
   * sequence and then swap, rather than highlighting
   * both simultaneously
   *
   * @remarks note that `swapDuration` and `props.Duration` are
   * different and serve different functions. `props.Duration`
   * specified the time taken to highlight the nodes. `swapDuration`
   * specified the time to swap the positions of the two nodes.
   */
  public *swapAndHighlight(
    index1: number,
    index2: number,
    props: HighlightProps = {
      Color: Colors.blue,
      Duration: 0.2,
      HighlightBorder: true,
      Subject: HighlightSubject.Both,
    },
    swapDuration = 0.5,
    segment = false,
  ) {
    if (segment) {
      yield* this.highlight(index1, props);
      yield* this.highlight(index2, props);
      yield* this.swap(index1, index2, swapDuration);
      yield* this.highlight(index1, props);
      yield* this.highlight(index2, props);
    } else {
      yield* all(this.highlight(index1, props), this.highlight(index2, props));
      yield* this.swap(index1, index2, swapDuration);
      yield* all(
        this.highlight(index1, {...props, Color: Colors.background}),
        this.highlight(index2, {...props, Color: Colors.background}),
      );
    }
  }
}
