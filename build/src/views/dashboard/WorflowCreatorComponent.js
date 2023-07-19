import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Input, Form, Card } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { AddCart, DeleteCart, EmptyCart } from '../../redux/cart/actions';
import { getItems, deleteItem } from '../../redux/product/actions';
import { addAppCustomNotification } from '../../components/NotificationBox';
import { useKeycloak } from '@react-keycloak/web';
import { createWorkflow } from '../../services/workflowService';
import { Base64 } from 'js-base64';

function WorkflowCreatorComponent({ products, getItems, AddCart, DeleteCart, deleteItem, EmptyCart }) {
  const [workflowName, setWorkflowName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { keycloak } = useKeycloak();
  useEffect(() => {
    // Fetch products on component mount
    getItems();
  }, [getItems]);

  const toggleProductSelection = (product) => {
    const { id } = product;
    setSelectedProducts((prev) => {
      const isSelected = prev.includes(id);

      if (isSelected) {
        DeleteCart(id); // Pass the product ID
        return prev.filter((productId) => productId !== id);
      } else {
        AddCart(product); // Add to cart
        return [...prev, id];
      }
    });
  };

  const handleDeleteProduct = (record) => {
    DeleteCart(record.id);
    deleteItem(record);
    setSelectedProducts((prev) => prev.filter((productId) => productId !== record.id));
  };

  const createWorkflowEvent = () => {
    if (!workflowName.trim()) {
      addAppCustomNotification('Workflow Creation', 'CRITICAL', 'Please provide a workflow name.');
      return;
    }

    if (workflowName.length > 50) {
      addAppCustomNotification('Workflow Creation', 'WARNING', 'Workflow name should not exceed 50 characters.');
      return;
    }
    // Dont allow empty workflow
    // if (selectedProducts.length === 0) {
    //   addAppCustomNotification('Workflow Creation', 'WARNING', 'Empty workflow.');
    // }

    let queries = [];
    let meta = [];

    Object.entries(selectedProducts).forEach(([key, item]) => {
      const matchingProduct = products.find((product) => product.id === item);
      if (matchingProduct) {
        // Add Base64-encoded pythonScript to queries
        queries.push(Base64.encode(matchingProduct.pythonScript));

        // Safely parse metaJSON and add it to the meta array
        try {
          const parsedMeta = JSON.parse(matchingProduct.metaJSON);
          meta.push(parsedMeta); // Push the parsed meta object into the meta array
        } catch (error) {
          console.error(`Failed to parse metaJSON for product ${item}:`, error);
        }
      }
    });

    // Prepare body content
    const bodyContent = {
      name: workflowName ? workflowName : uuidv4(), // Use provided workflowName or generate a UUID
      query: queries.length > 0 ? queries : [], // Only add queries if not empty
      meta: meta.length > 0 ? Base64.encode(JSON.stringify(meta.flat())) : '', // Encode flattened meta if not empty
    };

    // Convert body content to JSON string
    const data = JSON.stringify(bodyContent);

    createWorkflow(keycloak.token, data)
      .then((response) => {
        addAppCustomNotification('Workflow Creation', 'SUCCESS', `Workflow "${workflowName}" created successfully!`);
        EmptyCart();
      })
      .catch((error) => {
        addAppCustomNotification('Create Workflow', 'CRITICAL', error.message);
      });
    setWorkflowName(''); // Reset the workflow name
    setSelectedProducts([]); // Clear selection
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Date & Time Created',
      dataIndex: 'dateTime',
      key: 'dateTime',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button
            type={selectedProducts.includes(record.id) ? 'default' : 'primary'}
            onClick={() => toggleProductSelection(record)}
            style={{ marginRight: '8px' }}
          >
            {selectedProducts.includes(record.id) ? 'Unselect' : 'Select'}
          </Button>
          <Button type='danger' onClick={() => handleDeleteProduct(record)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Form layout='inline' style={{ marginBottom: '20px' }}>
        <Card>
          <Form.Item label='Workflow Name'>
            <Input
              placeholder='Enter workflow name'
              style={{ width: '300px' }}
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            />
          </Form.Item>
        </Card>
      </Form>
      <Table
        columns={columns}
        dataSource={products.map((product) => ({
          key: product.id,
          id: product.id,
          name: product.title,
          quantity: product.quantity,
          pythonScript: product.pythonScript,
          metaJSON: product.metaJSON,
          dateTime: product.dateTime,
        }))}
        footer={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              Total Selected: {selectedProducts.length}/{products.length}
            </span>
            <Button type='primary' onClick={() => createWorkflowEvent()}>
              Create Workflow
            </Button>
          </div>
        )}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  cart: state.cart.Carts,
  products: state.products.items,
});

const mapDispatchToProps = {
  AddCart,
  DeleteCart,
  getItems,
  deleteItem,
  EmptyCart,
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowCreatorComponent);
