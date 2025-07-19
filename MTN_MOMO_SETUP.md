# MTN Mobile Money Integration Setup

This guide explains how to set up MTN Mobile Money (MoMo) payment integration for the Koabiga application.

## Prerequisites

1. **MTN MoMo Developer Account**: You need to register at [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
2. **API Credentials**: Get your subscription key, API user, and API key from the MTN developer portal
3. **Callback URL**: Set up a public URL for payment callbacks

## Environment Configuration

Add the following variables to your `.env` file:

```env
# MTN Mobile Money Configuration
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_SUBSCRIPTION_KEY=your_subscription_key_here
MTN_MOMO_TARGET_ENVIRONMENT=sandbox
MTN_MOMO_API_USER=your_api_user_here
MTN_MOMO_API_KEY=your_api_key_here
MTN_MOMO_CALLBACK_URL=https://yourdomain.com/api/mtn-momo/callback
```

## Configuration Details

### Base URL
- **Sandbox**: `https://sandbox.momodeveloper.mtn.com`
- **Production**: `https://proxy.momoapi.mtn.com`

### Target Environment
- **Sandbox**: `sandbox`
- **Production**: `live`

### Subscription Key
- Get this from your MTN MoMo developer account
- Used for API authentication

### API User & API Key
- Generated in your MTN MoMo developer account
- Used for Basic Authentication

### Callback URL
- Must be publicly accessible
- MTN will send payment status updates to this URL
- Format: `https://yourdomain.com/api/mtn-momo/callback`

## API Endpoints

### Member Payment Endpoints
- `POST /api/member/payments/initiate` - Initiate a payment
- `POST /api/member/payments/check-status` - Check payment status
- `GET /api/member/payments/history` - Get payment history

### MTN MoMo Callback
- `POST /api/mtn-momo/callback` - Handle payment callbacks from MTN

## Payment Flow

1. **Member initiates payment** by clicking "Pay" on a fee
2. **System creates payment request** with MTN MoMo API
3. **MTN sends payment request** to member's phone
4. **Member completes payment** on their phone
5. **MTN sends callback** to our system with payment status
6. **System updates payment status** and fee application

## Testing

### Sandbox Testing
- Use sandbox environment for testing
- MTN provides test phone numbers
- No real money is transferred

### Test Phone Numbers
- Use any valid phone number format (e.g., 0789123456)
- MTN will simulate the payment process

## Production Deployment

1. **Update environment variables** to production values
2. **Set up SSL certificate** for callback URL
3. **Configure webhook security** if required
4. **Test with small amounts** first
5. **Monitor payment logs** for any issues

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check subscription key, API user, and API key
   - Verify target environment setting

2. **Callback Not Received**
   - Ensure callback URL is publicly accessible
   - Check server logs for incoming requests
   - Verify SSL certificate is valid

3. **Payment Status Not Updated**
   - Check payment polling mechanism
   - Verify database connection
   - Review error logs

### Logs

Payment-related logs are stored in:
- Laravel logs: `storage/logs/laravel.log`
- Payment-specific logs with prefix: `MTN MoMo`

## Security Considerations

1. **API Credentials**: Keep credentials secure and never commit to version control
2. **Callback Validation**: Validate callback data from MTN
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for payment endpoints
5. **Input Validation**: Validate all payment inputs

## Support

For MTN MoMo API issues:
- [MTN MoMo Developer Documentation](https://momodeveloper.mtn.com/API-collections)
- [MTN MoMo Support](https://momodeveloper.mtn.com/support)

For application-specific issues:
- Check Laravel logs
- Review payment service implementation
- Verify database migrations 