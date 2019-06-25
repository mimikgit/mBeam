import response from '../helper/response';
import queueProcessor from '../processors/queueProcessor';

function createItem(req, res) {
  const { mimikContext, body } = req;
  queueProcessor.createItem(mimikContext, body)
    .next((item => response.sendResult(item, 200, res)))
    .guard(err => response.sendError(err, 400, res))
    .go();
}

function getItemList(req, res) {
  const { mimikContext } = req;
  const { ownerCode } = req.swagger.params;
  if (ownerCode !== mimikContext.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else {
    queueProcessor.getItemList(mimikContext)
      .next((data => response.sendResult({ data }, 200, res)))
      .go();
  }
}

function getItem(req, res) {
  const { mimikContext } = req;
  const { ownerCode, id } = req.swagger.params;
  if (ownerCode !== req.mimikContext.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else {
    queueProcessor.getItem(mimikContext, id)
      .next((item => response.sendResult(item, 200, res)))
      .guard(err => response.sendError(err, 400, res))
      .go();
  }
}

function deleteItem(req, res) {
  const { mimikContext } = req;
  const { ownerCode, id } = req.swagger.params;

  if (ownerCode !== req.mimikContext.env.ownerCode) {
    response.sendError({ message: 'incorrect ownerCode' }, 403, res);
  } else {
    queueProcessor.deleteItem(mimikContext, id)
      .next((item => response.sendResult(item, 200, res)))
      .guard(err => response.sendError(err, 400, res))
      .go();
  }
}

module.exports = {
  createItem,
  getItemList,
  getItem,
  deleteItem,
};
