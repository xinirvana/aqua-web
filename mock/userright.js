import { parse } from 'url';

let userList = [];
for (let i = 0; i < 46; i += 1) {
  userList.push({
    id: i,
    username: `张三${i}`,
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

  console.log('Mock: got users');
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
  console.log('Mock: user added');
  return res.status(201).json({success: true, message: 'added'});
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
  console.log('Mock: user updated');
  return res.status(201).json({success: true, message: 'updated'});
}

function resetPwd(req, res, u, b) {
  const body = (b && b.body) || req.body;
  const { ids } = body;

  ids.forEach(id => {
    userList.forEach(item => {
      if (parseInt(item.id, 10) === parseInt(id, 10)) {
        item = Object.assign(item, {
          password: 888888,
          updated: new Date(),
        });
      }
    });
  });
  console.log('Mock: pwds reseted');
  return res.status(201).json({success: true, message: 'pwds reseted'});
}

function disable(req, res, u, b) {
  const body = (b && b.body) || req.body;
  const { ids } = body;

  ids.forEach(id => {
    userList.forEach(item => {
      if (parseInt(item.id, 10) === parseInt(id, 10) && parseInt(item.status, 10) === 1) {
        item = Object.assign(item, {
          status: 0,
          updated: new Date(),
        });
      }
    });
  });
  console.log('Mock: user disabled');
  return res.status(201).json({success: true, message: 'disabled'});
}

function deleteUsers(req, res, u, b) {
  const body = (b && b.body) || req.body;
  const { ids } = body;

  userList = userList.filter(item => ids.indexOf(parseInt(item.id, 10)) < 0);
  console.log('Mock: users deleted');
  return res.json({success: true, message: 'users deleted'});
}

function deleteUser(req, res, u) {
  let id = req.params.id;
  userList = userList.filter(item => parseInt(item.id, 10) !== parseInt(id, 10));
  console.log('Mock: user deleted');
  return res.json({success: true, message: 'deleted'});
}

let roleList = [];
for (let i = 0; i < 10; i += 1) {
  roleList.push({
    id: i,
    name: `角色${i}`,
    roleDesc: `角色${i}用于角色${i}`,
    created: new Date(`2019-03-${Math.floor(i / 2) + 1}`),
    updated: new Date(`2019-03-${Math.floor(i / 2) + 1}`),
  });
}

function getRole(req, res, u) {
  console.log('Mock: got roles');
  return res.json(roleList);
}

let userRole = [3, 5, 6];

function getUserRole(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }
  const params = parse(url, true).query;

  console.log('Mock: got roles of user ' + params.userId);
  return res.json(userRole);
}

function setUserRole(req, res, u, b) {
  const body = (b && b.body) || req.body;
  const { userId, roleIds } = body;

  userRole = roleIds;
  console.log('Mock: roles of user ' + userId + ' set');
  return res.status(201).json({success: true, message: 'roles set'});
}

export default {
  'GET /api/user': getUser,
  'GET /api/user/:id': getUserById,
  'POST /api/user': addUser,
  'PUT /api/user': updateUser,
  'PUT /api/user/resetpwd': resetPwd,
  'PUT /api/user/disable': disable,
  'DELETE /api/user': deleteUsers,
  'DELETE /api/user/:id': deleteUser,
  
  'GET /api/role': getRole,
  'GET /api/userrole': getUserRole,
  'PUT /api/userrole': setUserRole,
};
