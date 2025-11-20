import { s } from '@hashbrownai/core';

export const NEW_SHOW_SCHEMA = s.object('The new show properties', {
  description: s.string('This describes the show and what it is about'),
  rating: s.number('A number that rates the show'),
  year: s.number('The year the show was released'),
  genres: s.array(
    'The list of genres for the show',
    s.string('A genre that applies to the show'),
  ),
  imageUrl: s.string(
    'The URL of an image representing the show (poster or thumbnail)',
  ),
});
