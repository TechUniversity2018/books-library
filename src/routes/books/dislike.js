const joi = require('joi');

const models = require('../../../models');

module.exports = [
  {
    path: '/books/{bookId}/dislike',
    method: 'POST',
    config: {
      description: 'Set the like attribute for the specified book to false',
      tags: ['api'],
      validate: {
        params: {
          bookId: joi
            .number()
            .required()
            .description('bookId for the book to dislike'),
        },
      },
    },
    handler: (request, response) => {
      const id = Number(request.params.bookId);
      models.books.findOne({
        where: {
          bookId: id,
        },
      })
        .then((book) => {
          if (book === null) {
            throw new Error(`Could not find book with id: ${id}.`);
          }

          return models.likes.findOrCreate({
            where: {
              bookId: book.bookId,
            },
            defaults: {
              bookId: book.bookId,
              like: false,
            },
          });
        })
        .then(([bookLike, created]) => {
          if (!created && bookLike.like) {
            bookLike.updateAttributes({
              like: false,
            })
              .then(() => {
                response({
                  statusCode: 204,
                });
              });
          } else {
            response({
              statusCode: 204,
            });
          }
        })
        .catch(() => {
          response({
            data: {
              reason: 'Could not update book attributes.',
            },
            statusCode: 500,
          });
        });
    },
  },
];
