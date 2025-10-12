import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PrivacyNotice = () => {
  useEffect(() => {
    document.title = "Privacy Notice - SentiVibe";
  }, []);

  const content = `
# Privacy Notice

**Last Updated: October 26, 2023**

At SentiVibe (https://sentivibe.online), we are committed to protecting your privacy. This Privacy Notice explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this Privacy Notice carefully. If you do not agree with the terms of this Privacy Notice, please do not access the Service.

## 1. Information We Collect

We may collect information about you in a variety of ways. The information we may collect on the Service includes:

### Personal Data
Personally identifiable information, such as your name, email address, and any other information you voluntarily provide when you register with the Service, create a profile, or contact us. For paid services, payment information (e.g., credit card details) is processed securely by our third-party payment processor, Paddle.com Market Limited ("Paddle"). We do not store your full payment card details.

### Derivative Data
Information our servers automatically collect when you access the Service, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Service. This data is primarily used for analytics and to enforce usage limits for unauthenticated users.

### Financial Data
Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Service. This information is primarily handled by our Merchant of Record, Paddle.

### Data from Third Parties
Information from third parties, such as personal information or network data, if you connect your account to a third party (e.g., Google for authentication).

## 2. How We Use Your Information

Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
*   Create and manage your account.
*   Process your transactions and manage subscriptions (via Paddle).
*   Deliver targeted advertising (for free tier users).
*   Email you regarding your account or orders.
*   Enable user-to-user communications.
*   Generate and display AI-powered video analyses and comparisons.
*   Monitor and analyze usage and trends to improve your experience with the Service.
*   Notify you of updates to the Service.
*   Perform other business activities as needed.
*   Prevent fraudulent transactions and monitor against theft.

## 3. How We Share Your Information

We may share information we have collected about you in certain situations. Your information may be disclosed as follows:

### By Law or to Protect Rights
If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.

### Third-Party Service Providers
We may share your information with third parties that perform services for us or on our behalf, including payment processing (Paddle), data analysis, email delivery, hosting services, customer service, and marketing assistance.

### Marketing Communications
With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes, as permitted by law.

### Affiliates
We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Notice.

### Business Partners
We may share your information with our business partners to offer you certain products, services, or promotions.

### Other Users
When you post comments, contributions, or other content to the Service, other users may view your posts.

### Paddle (Merchant of Record)
For all paid transactions, Paddle acts as our Merchant of Record. This means Paddle is responsible for processing your payment, handling taxes, and managing subscriptions. Your payment information and certain personal details necessary for transaction processing are shared directly with Paddle. Paddle's own Privacy Policy will apply to the information they collect.

## 4. Data Retention

We retain your personal data only for as long as is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).

## 5. Your Rights

You have certain rights regarding your personal data, including:
*   **Access:** You can request a copy of the personal data we hold about you.
*   **Correction:** You can request that we correct any inaccurate personal data.
*   **Deletion:** You can request that we delete your personal data, subject to certain legal obligations.
*   **Objection:** You can object to our processing of your personal data in certain circumstances.

To exercise any of these rights, please contact us using the details below.

## 6. Security of Your Information

We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.

## 7. Third-Party Websites

The Service may contain links to third-party websites and applications of interest, including advertisements and external services. Once you have used these links to leave the Service, any information you provide to these third parties is not covered by this Privacy Notice, and we cannot guarantee the safety and privacy of your information.

## 8. Children's Privacy

We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us.

## 9. Changes to this Privacy Notice

We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Last Updated" date and will be effective as soon as it is accessible. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.

## 10. Contact Information

If you have questions or comments about this Privacy Notice, please contact us at [your-support-email@sentivibe.online].
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Privacy Notice</CardTitle>
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

export default PrivacyNotice;