export const tableColumnsBuilderFromArray = (jsonArray) => {
  if (jsonArray.length === 0) {
    return [];
  }
  let columns = [];
  for (var prop in jsonArray[0]) {
    if (jsonArray[0].hasOwnProperty(prop)) {
      columns.push({
        dataIndex: prop.toLowerCase(),
        title: prop,
        key: prop.toLowerCase(),
      });
    }
  }
  return columns;
};

export const tableDatasourceBuilderFromArray = (jsonArray) => {
  let datasource = [];

  for (let i = 0; i < jsonArray.length; i++) {
    var item = {
      key: i,
    };

    for (const key in jsonArray[i]) {
      if (Object.hasOwnProperty.call(jsonArray[i], key)) {
        const prop_value = jsonArray[i][key];

        item[key.toLowerCase()] = prop_value;
      }
    }

    datasource.push(item);
  }
  return datasource;
};
