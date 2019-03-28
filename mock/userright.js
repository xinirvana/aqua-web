import { parse } from 'url';

let userList = [];
for (let i = 0; i < 46; i += 1) {
  userList.push({
    id: i,
    username: `张三 ${i}`,
    password: null,
    phone: '1388888888' + (i % 10),
    email: 'zs' + i + '@123.com',
    status: i % 2,
    created: new Date(`2019-03-${Math.floor(i / 2) + 1}`),
    updated: new Date(`2019-03-${Math.floor(i / 2) + 1}`),
  });
}

function getUser(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }
  const params = parse(url, true).query;

  let dataSource = userList;

  if (params.sorter) {
    const s = params.sorter.split('_');
    dataSource = dataSource.sort((prev, next) => {
      if (s[1] === 'descend') {
        return next[s[0]] - prev[s[0]];
      }
      return prev[s[0]] - next[s[0]];
    });
  }

  if (params.status) {
    const status = params.status.split(',');
    let filterDataSource = [];
    status.forEach(s => {
      filterDataSource = filterDataSource.concat(
        dataSource.filter(data => parseInt(data.status, 10) === parseInt(s[0], 10))
      );
    });
    dataSource = filterDataSource;
  }

  if (params.username) {
    dataSource = dataSource.filter(data => data.username.indexOf(params.username) > -1);
  }

  if (params.phone) {
    dataSource = dataSource.filter(data => data.phone.indexOf(params.phone) > -1);
  }

  if (params.email) {
    dataSource = dataSource.filter(data => data.email.indexOf(params.email) > -1);
  }

  if (params.createdSt && params.createdEd) {
    dataSource = dataSource.filter(
      data => data.created >= params.createdSt && data.created <= params.createdEd
    );
  }

  let pageSize = 10;
  if (params.pageSize) {
    pageSize = params.pageSize * 1;
  }

  const result = {
    list: dataSource,
    pagination: {
      total: dataSource.length,
      pageSize,
      current: parseInt(params.currentPage, 10) || 1,
    },
  };

  return res.json(result);
}

function getUserById(req, res) {
  let id = req.params.id;
  let user =
    userList.filter(item => parseInt(item.id, 10) === parseInt(id, 10)) &&
    userList.filter(item => parseInt(item.id, 10) === parseInt(id, 10))[0];
  return res.json(user);
}

function addUser(req, res, u, b) {
  const body = (b && b.body) || req.body;
  const { username, phone, email, status } = body;

  const i = Math.ceil(Math.random() * 10000);
  userList.unshift({
    id: i,
    username: username,
    password: null,
    phone: phone,
    email: email,
    status: status,
    created: new Date(),
    updated: new Date(),
  });
  console.log('added');
  return getUser(req, res, u);
  //return res.json({success: true, message: 'added'});
}

function updateUser(req, res, u, b) {
  const body = (b && b.body) || req.body;
  const { id, username, phone, email, status } = body;

  userList.forEach(item => {
    if (parseInt(item.id, 10) === parseInt(id, 10)) {
      item = Object.assign(item, {
        username: username || item.username,
        phone: phone || item.phone,
        email: email || item.email,
        status: status || item.status,
        updated: new Date(),
      });
    }
  });
  console.log('updated');
  return getUser(req, res, u);
  //return res.json({success: true, message: 'updated'});
}

function deleteUser(req, res, u) {
  let id = req.params.id;
  userList = userList.filter(item => parseInt(item.id, 10) !== parseInt(id, 10));
  console.log('deleted');
  return getUser(req, res, u);
  //return res.json({success: true, message: 'deleted'});
}

export default {
  'GET /api/user': getUser,
  'GET /api/user/:id': getUserById,
  'POST /api/user': addUser,
  'PUT /api/user': updateUser,
  'DELETE /api/user/:id': deleteUser,
};
