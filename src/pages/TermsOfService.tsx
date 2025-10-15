import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Terms of Service - SentiVibe";
  }, []);

  const content = `
# Terms of Service

**Last Updated: October 26, 2023**

Welcome to SentiVibe! These Terms of Service ("Terms") govern your access to and use of the SentiVibe website, services, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Service.

## 1. Acceptance of Terms

By creating an account, accessing, or using the Service, you confirm that you have read, understood, and agree to be bound by these Terms, including any future modifications. You must be at least 13 years old to use the Service. If you are under 18, you represent that you have reviewed these Terms with your parent or legal guardian and that they agree to these Terms on your behalf.

## 2. Changes to Terms

We reserve the right to modify or update these Terms at any time. We will notify you of any material changes by posting the new Terms on the Service or through other communication channels. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.

## 3. User Accounts

To access certain features of the Service, you may be required to create an account. You agree to:
*   Provide accurate, current, and complete information during the registration process.
*   Maintain the security of your password and identification.
*   Notify us immediately of any unauthorized use of your account.
*   Be responsible for all activities that occur under your account.

## 4. User Conduct

You agree not to use the Service to:
*   Violate any local, state, national, or international law or regulation.
*   Infringe upon the rights of others, including intellectual property rights.
*   Transmit any harmful, threatening, defamatory, obscene, or otherwise objectionable content.
*   Engage in any activity that disrupts or interferes with the Service.
*   Attempt to gain unauthorized access to any part of the Service or other user accounts.

## 5. Intellectual Property

All content, features, and functionality on the Service, including text, graphics, logos, and software, are the exclusive property of SentiVibe or its licensors and are protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of any content from the Service without our express written permission.

## 6. Disclaimers

The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, secure, or free of viruses or other harmful components.

## 7. Limitation of Liability

To the fullest extent permitted by applicable law, SentiVibe shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Service; (b) any conduct or content of any third party on the Service; or (c) unauthorized access, use, or alteration of your transmissions or content.

## 8. Indemnification

You agree to indemnify, defend, and hold harmless SentiVibe, its affiliates, officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your access to or use of the Service or your violation of these Terms.

## 9. Governing Law

These Terms shall be governed by and construed in accordance with the laws of the city of Kolkata, India, without regard to its conflict of law principles.

## 10. Contact Information

If you have any questions about these Terms, please contact us at inquiries@sentivibe.online.
  `;

  return (
    <div className="container mx-auto p-4 max-w-3xl bg-background text-foreground">
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
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

export default TermsOfService;