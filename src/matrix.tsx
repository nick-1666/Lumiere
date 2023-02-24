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
import {makeRef, range} from '@motion-canvas/core/lib/utils';
import {colors, whiteLabel} from '@components/Styles';
import {ArrayEntry, HighlightProps, HighlightSubject} from './array/ArrayEntry';

/**
 * `Top` - Renders the name on the top of the array
 * `Bottom` - Renders the name on the bottom of the array
 * @remarks note: the name will be centred horizontally
 */
export enum Align {
  Top,
  Bottom,
}
/**
 * @param values - The values of the array
 * @param name - The name of the array
 * @param suffix - The suffix of the name
 * @param suffixColor - Used for coloring the
 * suffix
 * @param align - The alignment of the array's name
 * @see {@link LabeledArray}, {@link Align}
 * @remarks suffix is usually used
 * to show the type of the array
 * such as the name `intArr int[]`
 * where `int[]` is the suffix.
 */
export interface ArrayProps extends RectProps {
  values: SignalValue<number[][]>;
  name?: SignalValue<string>;
  suffix?: SignalValue<string>;
  suffixColor?: SignalValue<PossibleColor>;
  align?: SignalValue<Align>;
}

export class Matrix extends Rect {
  @signal()
  public declare readonly values: SimpleSignal<number[][], this>;

  @initial('matrix')
  @signal()
  public declare readonly name: SimpleSignal<string, this>;

  @initial('[][]')
  @signal()
  public declare readonly suffix: SimpleSignal<string, this>;

  @initial(colors.blue)
  @signal()
  public declare readonly suffixColor: ColorSignal<this>;

  @initial(Align.Top)
  @signal()
  public declare readonly align: SimpleSignal<Align, this>;

  @initial([])
  @signal()
  public boxArray = createSignal<ArrayEntry[], this>([]);

  private getBox(pos: number[]): ArrayEntry;
  private getBox(row: number, col: number): ArrayEntry;

  private getBox(pos: number[] | number, col?: number): ArrayEntry {
    if (typeof pos === 'number') {
      return this.boxArray()[pos * this.values()[0].length + col];
    } else {
      return this.boxArray()[pos[0] * this.values()[0].length + pos[1]];
    }
  }

  private row = (row: number, max: number) =>
    range(max).map(i => {
      return (
        <ArrayEntry
          ref={makeRef(this.boxArray(), row * this.values()[row].length + i)}
          x={-((this.values()[row].length * 80) / 2) + i * 80 + 40}
          index={i}
          value={this.values()[row][i]}
          label={''}
        />
      );
    });

  private pool = (col: number) =>
    range(col).map(i => {
      return (
        <Node y={-(this.values().length * 80) / 2 + i * 80 + 40}>
          {this.row(i, this.values()[i].length)}
        </Node>
      );
    });
  /**
   * An array component used for
   * containing characters and
   * numerical values.
   * @see {@link ArrayProps}
   */
  public constructor(props?: ArrayProps) {
    super({
      size: () => [
        this.values()[0].length * 80 + 20,
        this.values().length * 80 + 20,
      ],
      spawner: () => this.pool(this.values().length),
      smoothCorners: true,
      cornerSharpness: 0.65,
      radius: 20,
      fill: colors.surface,
      ...props,
    });

    this.add(
      <Layout
        direction="row"
        gap={10}
        layout
        offsetY={this.align() === Align.Top ? 1 : -1}
        y={
          this.align() === Align.Top
            ? this.size().y - 45 * this.values().length
            : -this.size().y + 45 * this.values().length
        }
      >
        <Text {...whiteLabel} text={this.name()} />
        <Text {...whiteLabel} fill={this.suffixColor()} text={this.suffix()} />
      </Layout>,
    );
  }

  public *highlight(pos: number[], props: HighlightProps) {
    yield* this.getBox(pos).highlight(props);
  }

  /**
   * Highlight just the border of a node
   * in the array.
   * @param duration - The duration (in seconds) of the highlight animation
   */
  public *highlightBorder(
    row: number,
    col: number,
    color: PossibleColor = colors.background,
    duration = 0.2,
  ) {
    yield* this.boxArray()[
      row * this.values()[row].length + col
    ].highlightBorder(color, duration);
  }

  /**
   * Animate the swap of two nodes in the
   * array component.
   * @param index1 - The first node's position in the matrix
   * @param index2 - The first node's position in the matrix
   * @param duration - The duration (in seconds) of the swap animation
   */
  public *swap(pos1: number[], pos2: number[], duration = 0.2) {
    yield* all(
      this.getBox(pos1).absolutePosition(
        this.getBox(pos2).absolutePosition(),
        duration,
      ),
      this.getBox(pos2).absolutePosition(
        this.getBox(pos1).absolutePosition(),
        duration,
      ),
    );

    [
      this.boxArray()[pos1[0] * this.values().length + pos1[1]],
      this.boxArray()[pos2[0] * this.values().length + pos2[1]],
    ] = [
      this.boxArray()[pos2[0] * this.values().length + pos2[1]],
      this.boxArray()[pos1[0] * this.values().length + pos1[1]],
    ];
  }

  /**
   * Swap two node's positions and highlight them before
   * doing so
   * @param index1 - The first node's index
   * @param index2 - The Second node's index
   * @param props - {@link HighlightProps}
   * @param swapDuration - The animation duration (in seconds) of
   * _just_ the swap and _not_ the highlight animation period.
   * @param segment - If true, highlight each node in
   * sequence and then swap, rather than highlighting
   * both simultaneously
   * @remarks note that `swapDuration` and `props.Duration` are
   * different and serve different functions. `props.Duration`
   * specified the time taken to highlight the nodes. `swapDuration`
   * specified the time to swap the positions of the two nodes.
   */
  public *swapAndHighlight(
    pos1: number[],
    pos2: number[],
    props: HighlightProps = {
      Color: colors.blue,
      Duration: 0.2,
      HighlightBorder: true,
      Subject: HighlightSubject.Both,
    },
    swapDuration = 0.5,
    segment = false,
  ) {
    if (segment) {
      yield* this.highlight(pos1, props);
      yield* this.highlight(pos2, props);
      yield* this.swap(pos1, pos2, swapDuration);
      yield* this.highlight(pos1, props);
      yield* this.highlight(pos2, props);
    } else {
      yield* all(this.highlight(pos1, props), this.highlight(pos2, props));
      yield* this.swap(pos1, pos2, swapDuration);
      yield* all(
        this.highlight(pos1, {...props, Color: colors.background}),
        this.highlight(pos2, {...props, Color: colors.background}),
      );
    }
  }
}
