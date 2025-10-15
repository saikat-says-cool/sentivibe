import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const RefundPolicy = () => {
  useEffect(() => {
    document.title = "Refund Policy - SentiVibe";
  }, []);

  const content = `
# Refund Policy

**Last Updated: October 26, 2023**

This Refund Policy outlines the terms and conditions for refunds for services purchased through SentiVibe (https://sentivibe.online). Please read this policy carefully before making any purchases.

## 1. General Policy

All sales of digital services, including subscriptions to our Paid Tier, are generally **final and non-refundable**. We offer a Free Tier and detailed descriptions of our services to allow you to evaluate SentiVibe before committing to a paid subscription.

## 2. Eligibility for Refund (Limited Exceptions)

We may offer a refund in the following limited circumstances, at our sole discretion:

*   **Technical Issues:** If you experience a persistent, critical technical issue with our Paid Tier service that prevents you from using its core features, and we are unable to resolve the issue within a reasonable timeframe after you have provided all necessary information and cooperation.
*   **Billing Error:** In the event of a clear billing error on our part.

Refund requests based on dissatisfaction with the service, change of mind, or failure to utilize the service will generally not be granted.

## 3. Non-Refundable Services

The following services are explicitly non-refundable:

*   Any usage of the Free Tier.
*   Partial usage of a subscription period.
*   Services where the issue is due to user error, incompatibility with third-party software/hardware, or internet connectivity problems on the user's end.

## 4. How to Request a Refund

To request a refund, you must:

1.  Contact our support team at inquiries@sentivibe.online within **7 days** of the purchase date.
2.  Provide your account email, transaction ID, and a detailed explanation of the reason for your refund request, including any relevant screenshots or error messages.

All refund requests will be reviewed on a case-by-case basis.

## 5. Processing Refunds

If a refund is approved:

*   Refunds will be processed through our Merchant of Record, Paddle.
*   The refund will be issued to the original payment method used for the purchase.
*   Please allow 5-10 business days for the refund to appear on your statement, depending on your bank or payment provider.
*   Upon refund, your access to the Paid Tier services will be immediately terminated.

## 6. Changes to this Policy

We reserve the right to modify this Refund Policy at any time. Any changes will be effective immediately upon posting the updated policy on our website. Your continued use of our services after such changes constitutes your acceptance of the revised policy.

## 7. Contact Information

If you have any questions about our Refund Policy, please contact us at inquiries@sentivibe.online.
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-background text-foreground">
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Refund Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundPolicy;