import { s } from '@hashbrownai/core';

const legendSchema = s.object('the legend for the chart', {
  display: s.boolean('whether to display the legend'),
  position: s.enumeration('the position of the legend', [
    'top',
    'bottom',
    'left',
    'right',
  ]),
  align: s.enumeration('alignment of the legend items', [
    'start',
    'center',
    'end',
  ]),
  labels: s.object('the labels configuration for the legend', {
    color: s.string('the color of the label text'),
    font: s.object('the font options for legend labels', {
      family: s.string('the font family'),
      size: s.number('the font size'),
      style: s.enumeration('the font style', [
        'normal',
        'italic',
        'oblique',
        'initial',
        'inherit',
      ]),
      weight: s.number('the font weight'),
      lineHeight: s.number('the line height for labels'),
    }),
  }),
  title: s.object('the title configuration for the chart', {
    display: s.boolean('whether to display the title'),
    text: s.string('the title text'),
    color: s.string('the color of the title'),
    font: s.object('the font options for the title', {
      family: s.string('the font family'),
      weight: s.number('the font weight'),
      size: s.number('the font size'),
      lineHeight: s.number('the line height for the title'),
    }),
  }),
});

/** Interaction (pie): allow omitting the whole object.
 *  When provided, fields must be valid Chart.js values (no nulls).
 */
const interactionSchema = s.anyOf([
  s.object('the interaction for the chart', {
    mode: s.enumeration('the mode of the interaction', [
      'nearest',
      'point',
      'index',
      'x',
      'y',
      'dataset',
    ]),
    axis: s.enumeration('the axis of the interaction', ['x', 'y', 'xy']),
    intersect: s.boolean('whether to intersect the interaction'),
  }),
  s.nullish(),
]);

// Pie-only options (no scales)
const optionsSchema = s.object('the options for the chart', {
  plugins: s.object('the plugins for the chart', {
    legend: legendSchema,
    title: s.object('the title configuration for the chart', {
      display: s.boolean('whether to display the title'),
      text: s.string('the title text'),
      position: s.enumeration('the position of the title', ['top', 'bottom']),
      color: s.string('the color of the title'),
      align: s.enumeration('alignment of the title', [
        'start',
        'center',
        'end',
      ]),
    }),
  }),
  interaction: interactionSchema,
});

// Single pie chart schema
const pieChartSchema = s.object('a pie chart', {
  type: s.literal('pie'),
  data: s.object('The data for a pie chart', {
    labels: s.array(
      'The labels for the pie chart',
      s.string('an individual label'),
    ),
    datasets: s.array(
      'The datasets for the pie chart',
      s.object('a dataset', {
        label: s.string('the label of the dataset'),
        data: s.array(
          'the data points for the dataset',
          s.number('a data point'),
        ),
        backgroundColor: s.array(
          'the CSS colors for the dataset',
          s.string('a CSS color'),
        ),
        borderColor: s.anyOf([
          s.string('border color for all slices'),
          s.array('per-slice border colors', s.string('a CSS color')),
          s.nullish(),
        ]),
        borderWidth: s.anyOf([s.number('slice border width'), s.nullish()]),
      }),
    ),
  }),
});

export const PIE_CHART_SCHEMA = s.object('pie chart properties', {
  chart: pieChartSchema,
  options: optionsSchema,
});
