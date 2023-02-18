import {Rect, RectProps, Text} from '@motion-canvas/2d/lib/components';
import {signal} from '@motion-canvas/2d/lib/decorators';
import {all} from '@motion-canvas/core/lib/flow';
import {SignalValue, SimpleSignal} from '@motion-canvas/core/lib/signals';
import {ThreadGenerator} from '@motion-canvas/core/lib/threading';
import {easeInOutCubic, tween} from '@motion-canvas/core/lib/tweening';
import {Color, PossibleColor} from '@motion-canvas/core/lib/types';
import {createRef} from '@motion-canvas/core/lib/utils';
import {BlackLabel, Colors, WhiteLabel} from '../Styles';

/**
 * An enum for highlighting a value, label or both
 * @remarks
 * This is used as a value for subject in {@link HighlightProps}
 */
export enum HighlightSubject {
  Label,
  Value,
  Both,
}

/**
 * An interface for providing arguments to the
 * {@link ArrayEntry.highlight} method.
 *
 * @param Color The color to highlight in
 * @param Subject The subject to highlight
 * @param Duration The duration of animation (in seconds)
 * @param HighlightBorder If true, this will highlight the node's
 * border in the specified highlight color.
 * @see {@link HighlightSubject}
 */
export interface HighlightProps {
  Color?: PossibleColor;
  Subject?: HighlightSubject;
  Duration?: number;
  HighlightBorder?: boolean;
}

export interface EntryProps extends RectProps {
  index: SignalValue<number>;
  value: SignalValue<string | number>;
  label?: SignalValue<string | number>;
}

export class ArrayEntry extends Rect {
  @signal()
  public declare readonly index: SimpleSignal<number, this>;

  @signal()
  public declare readonly value: SimpleSignal<number | string, this>;

  @signal()
  public declare readonly label: SimpleSignal<number | string, this>;

  private readonly ref = createRef<Rect>();

  public constructor(props: EntryProps) {
    super({
      ...props,
    });

    if (this.label() === undefined) {
      this.label(this.index());
    }

    this.add(
      <Rect
        ref={this.ref}
        smoothCorners={true}
        cornerSharpness={0.65}
        radius={10}
        size={[60, 60]}
        fill={Colors.background}
        gap={40}
        padding={15}
        strokeFirst={true}
        stroke={Colors.background}
        lineWidth={8}
        justifyContent="start"
        alignItems="center"
        direction="column"
        layout={true}
      >
        <Text
          {...WhiteLabel}
          lineHeight={WhiteLabel.fontSize}
          text={`${props.value}`}
        />
        <Text
          lineHeight={WhiteLabel.fontSize}
          {...WhiteLabel}
          fontSize={BlackLabel.fontSize * 0.7}
          text={`${props.label}`}
        />
      </Rect>,
    );
  }

  public *highlightBorder(
    HighlightColor: PossibleColor = Colors.background,
    Duration = 0.2,
  ) {
    yield* tween(Duration, value => {
      this.ref().stroke(
        Color.lerp(
          this.ref().stroke() as Color,
          new Color(HighlightColor),
          easeInOutCubic(value),
        ),
      );
    });
  }

  private *highlightText(
    node: Rect,
    HighlightColor: PossibleColor = Colors.background,
    Duration = 0.2,
  ) {
    yield* tween(Duration, value => {
      node.fill(
        Color.lerp(
          node.fill() as Color,
          new Color(HighlightColor),
          easeInOutCubic(value),
        ),
      );
    });
  }

  public *highlightLabel(
    HighlightColor: PossibleColor = Colors.background,
    Duration = 0.2,
  ) {
    const label = this.ref().children()[1] as Rect;
    yield* this.highlightText(label, HighlightColor, Duration);
  }

  public *highlightValue(
    HighlightColor: PossibleColor = Colors.background,
    Duration = 0.2,
  ) {
    const label = this.ref().children()[0] as Rect;
    yield* this.highlightText(label, HighlightColor, Duration);
  }

  /**
   * Highlights a node with a
   * specified color.
   *
   * @see {@link HighlightProps}
   */
  public *highlight(
    options: HighlightProps = {
      Color: Colors.background,
      Duration: 0.2,
      HighlightBorder: true,
      Subject: HighlightSubject.Both,
    },
  ): ThreadGenerator {
    const tasks = [];

    if (this.highlightBorder) {
      tasks.push(this.highlightBorder(options.Color, options.Duration));
    }

    switch (options.Subject) {
      case HighlightSubject.Label:
        tasks.push(this.highlightLabel(options.Color, options.Duration));
        break;
      case HighlightSubject.Value:
        tasks.push(this.highlightValue(options.Color, options.Duration));
        break;
      case HighlightSubject.Both:
      default:
        if (options.Color == Colors.background) {
          tasks.push(this.highlightValue(Colors.whiteLabel, options.Duration));
          tasks.push(this.highlightLabel(Colors.whiteLabel, options.Duration));
        } else {
          tasks.push(this.highlightValue(options.Color, options.Duration));
          tasks.push(this.highlightLabel(options.Color, options.Duration));
        }
        break;
    }
    yield* all(...tasks);
  }
}
