export const questAccessHelper = function (req) {
  let token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJ1c2VySUQiOiJxdWVzdCIsImlhdCI6MTY3OTE3MDk2NCwiZXhwIjoxNjc5MTcxNTA0fQ.' +
    'nxX4po__P3out0lwazvTqdAdH6nErLiA4szRvxyiaOo';

  if (req.headers.authorization) {
    if (req.headers.authorization.slice(0, 5) === 'Basic') {
      return token;
    }
    token = req.headers.authorization.substring(7);
  }
  return token;
};
