import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button, Radio, FormControlLabel, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import './Cart.css';

const Cart = ({ cart, setCart }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [upiId, setUpiId] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [openPopup, setOpenPopup] = useState(false);

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(quantity, 1) } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const applyGST = (total) => total * 0.18;
  const applyDiscount = (total, discount) => total * (1 - discount / 100);

  const handleCheckout = () => {
    // Validate address fields for all payment methods
    if (!address || !city || !zipCode) {
      alert('Please fill out all shipping address fields.');
      return;
    }

    // Payment method specific validations
    if (paymentMethod === 'credit-card') {
      if (!cardNumber || !cardExpiry || !cardCVC) {
        alert('Please fill out all credit card details.');
        return;
      }
      console.log('Processing credit card payment...');
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        alert('Please enter your UPI ID.');
        return;
      }
      console.log('Processing UPI payment...');
    } else if (paymentMethod === 'paypal') {
      console.log('Redirecting to PayPal...');
    }
  
    const orderDetails = {
      items: cart,
      totalAmount: discountedTotal.toFixed(2),
      shippingAddress: {
        address,
        city,
        zipCode
      },
      paymentMethod,
      ...(paymentMethod === 'upi' && { upiId }),
      ...(paymentMethod === 'credit-card' && { 
        cardLastFour: cardNumber.slice(-4) 
      })
    };
  
    // Send the order to the server to be saved in orders.json
    fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Order saved:', data);
        setOpenPopup(true); // Open popup to confirm order
        setCart([]); // Clear the cart after successful order
      })
      .catch((error) => {
        console.error('Error saving order:', error);
        alert('There was an issue processing your order. Please try again.');
      });
  };

  const handleAddressChange = (e) => {
    switch (e.target.name) {
      case 'address':
        setAddress(e.target.value);
        break;
      case 'city':
        setCity(e.target.value);
        break;
      case 'zipCode':
        setZipCode(e.target.value);
        break;
      default:
        break;
    }
  };

  const total = calculateTotal();
  const gst = applyGST(total);
  const discount = 10; // Example discount
  const discountedTotal = applyDiscount(total + gst, discount);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {[...Array(fullStars)].map((_, index) => (
          <FaStar key={index} style={{ color: '#f5c518', marginRight: '2px' }} />
        ))}
        {halfStar && <FaStarHalfAlt style={{ color: '#f5c518', marginRight: '2px' }} />}
        {[...Array(emptyStars)].map((_, index) => (
          <FaRegStar key={index} style={{ color: '#f5c518', marginRight: '2px' }} />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 0.5, sm: 1 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Your Cart
      </Typography>
      {cart.length === 0 ? (
        <Typography variant="body1">Your cart is empty.</Typography>
      ) : (
        cart.map((item) => (
          <Card 
            key={item.id} 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              mb: 2, 
              maxWidth: { xs: '100%', sm: 250 }, 
              boxShadow: 3, 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              backgroundColor: '#fff'
            }}
          >
            <CardMedia
              component="img"
              sx={{ 
                width: { xs: '100%', sm: 100 }, 
                height: { xs: 100, sm: 140 }, 
                objectFit: 'cover', 
                borderRadius: '8px',
                margin: '0.5rem'
              }}
              image={item.image}
              alt={item.name}
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {item.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                ${item.price.toFixed(2)}
              </Typography>
              <Box sx={{ mb: 1 }}>
                {renderStars(item.rating)}
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Quantity:</Typography>
                <TextField
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{ width: '60px', marginTop: '0.5rem' }}
                />
              </Box>
              <Button 
                variant="contained" 
                color="error" 
                sx={{ borderRadius: '5px' }} 
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))
      )}
      {cart.length > 0 && (
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: { sm: 600 }, 
            mt: 3, 
            p: 2, 
            boxShadow: 3, 
            border: '1px solid #ddd', 
            borderRadius: '8px'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Summary
          </Typography>
          <Typography variant="body1">Total: ₹{total.toFixed(2)}</Typography>
          <Typography variant="body1">GST: ₹{gst.toFixed(2)}</Typography>
          <Typography variant="body1">Discount: {discount}%</Typography>
          <Typography variant="body1">Total after discount: ₹{discountedTotal.toFixed(2)}</Typography>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Payment Options
          </Typography>
          <FormControlLabel
            control={
              <Radio
                value="credit-card"
                checked={paymentMethod === 'credit-card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            }
            label="Credit Card"
          />
          <FormControlLabel
            control={
              <Radio
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            }
            label="UPI"
          />
          <FormControlLabel
            control={
              <Radio
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            }
            label="PayPal"
          />

          {paymentMethod === 'credit-card' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Credit Card Details
              </Typography>
              <TextField
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                fullWidth
                sx={{ mb: 1 }}
              />
              <TextField
                label="Expiry Date (MM/YY)"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                fullWidth
                sx={{ mb: 1 }}
              />
              <TextField
                label="CVV"
                value={cardCVC}
                onChange={(e) => setCardCVC(e.target.value)}
                fullWidth
              />
            </Box>
          )}

          {paymentMethod === 'upi' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                UPI Details
              </Typography>
              <TextField
                label="UPI ID (e.g., name@upi)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                fullWidth
              />
            </Box>
          )}

          {paymentMethod === 'paypal' && (
            <Typography sx={{ mt: 2 }}>
              You will be redirected to PayPal to complete your payment.
            </Typography>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Shipping Address
            </Typography>
            <TextField
              label="Address"
              name="address"
              value={address}
              onChange={handleAddressChange}
              fullWidth
              required
              sx={{ mb: 1 }}
            />
            <TextField
              label="City"
              name="city"
              value={city}
              onChange={handleAddressChange}
              fullWidth
              required
              sx={{ mb: 1 }}
            />
            <TextField
              label="Zip Code"
              name="zipCode"
              value={zipCode}
              onChange={handleAddressChange}
              fullWidth
              required
            />
          </Box>

          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={handleCheckout}
            fullWidth
          >
            Checkout
          </Button>
        </Box>
      )}

      <Dialog open={openPopup} onClose={() => setOpenPopup(false)}>
        <DialogTitle>Order Confirmed</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Thank you for your purchase!</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Your order has been placed successfully.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPopup(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cart;