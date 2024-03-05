const { body, validationResult } = require('express-validator');

const ticketValidationMiddleware = [
  body('tickets').isArray().withMessage('Tickets must be provided as an array'),
  body('tickets.*.ticketPrice').notEmpty().withMessage('Ticket price cannot be empty')
                               .isNumeric().withMessage('Ticket price must be a number'),
  body('tickets.*.ticketCount').notEmpty().withMessage('Ticket count cannot be empty')
                               .isNumeric().withMessage('Ticket count must be a number'),
  body('tickets.*.remainingTickets').notEmpty().withMessage('Remaining tickets cannot be empty')
                                     .isNumeric().withMessage('Remaining tickets must be a number'),
  body('tickets.*._id').notEmpty().withMessage('_id must be provided'),
  body('tickets.*.Quantity').notEmpty().withMessage('Ticket quantity cannot be empty')
                            .isNumeric().withMessage('Ticket quantity must be a number'),
];

const validateTicketData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = { ticketValidationMiddleware, validateTicketData };
