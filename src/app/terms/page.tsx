import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: September 3, 2025</p>
        </div>

        {/* Content */}
        <Card className="p-8 space-y-8">
          {/* Acceptance */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using ESN Dex (hereinafter &quot;Application&quot;, &quot;Service&quot; or &quot;Platform&quot;), 
              you fully agree to these Terms of Service. If you do not agree with any part of these terms, 
              you should not use our application.
            </p>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ESN Dex is a gamified social platform for Erasmus students that offers:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Challenge and social activity system</li>
              <li>ESN student profiles</li>
              <li>Networking functionalities</li>
              <li>Scoring and gamification system</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Disclaimer of Liability</h2>
            <Card className="border-2 border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-destructive font-medium">⚠️ IMPORTANT: READ CAREFULLY</p>
              </CardContent>
            </Card>
            <div className="space-y-4 text-muted-foreground mt-4">
              <p className="leading-relaxed">
                <strong>3.1 Use at Your Own Risk:</strong> You use this application at your own risk. 
                The developer is not responsible for any damage, loss or consequence arising from the use of the platform.
              </p>
              <p className="leading-relaxed">
                <strong>3.2 Challenges and Activities:</strong> The challenges and activities proposed by the 
                application are purely recreational. The developer is not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Accidents or injuries during challenge completion</li>
                <li>Social, academic or personal consequences of activities</li>
                <li>Inappropriate behavior between users</li>
                <li>Decisions made based on platform information</li>
              </ul>
              <p className="leading-relaxed">
                <strong>3.3 Third-Party Content:</strong> The platform may contain user-generated content. 
                The developer does not control or take responsibility for this content.
              </p>
            </div>
          </section>

          {/* User Responsibility */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. User Responsibilities</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">By using the application, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the platform responsibly and legally</li>
                <li>Not share offensive, illegal or inappropriate content</li>
                <li>Respect other users and their personal information</li>
                <li>Not use the platform for illegal or harmful activities</li>
                <li>Take full responsibility for your actions and decisions</li>
                <li>Verify the legality and safety of challenges before completing them</li>
              </ul>
            </div>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Data and Privacy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                <strong>5.1 Data Collection:</strong> The application collects basic profile information 
                and challenge progress for platform functionality.
              </p>
              <p className="leading-relaxed">
                <strong>5.2 Data Usage:</strong> Data is used exclusively for platform operation. 
                We do not sell or share personal data with third parties.
              </p>
              <p className="leading-relaxed">
                <strong>5.3 Security:</strong> While we implement security measures, you acknowledge 
                that no system is 100% secure.
              </p>
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Service Limitations</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed font-medium">
                The service is provided &quot;as is&quot; without warranties of any kind. The developer 
                does not guarantee that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The application will always be available or error-free</li>
                <li>Information is accurate or up-to-date</li>
                <li>The service meets your specific needs</li>
                <li>Technical problems will be fixed immediately</li>
              </ul>
            </div>
          </section>

          {/* Liability Limitation */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <Card className="border-2 border-destructive/50 bg-destructive/10">
              <CardContent className="p-4">
                <p className="text-destructive font-medium">🚨 MAXIMUM LIMITATION CLAUSE</p>
              </CardContent>
            </Card>
            <div className="space-y-4 text-muted-foreground mt-4">
              <p className="leading-relaxed font-medium">
                UNDER NO CIRCUMSTANCES SHALL THE DEVELOPER, ITS AFFILIATES, DIRECTORS, EMPLOYEES 
                OR AGENTS BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Direct, indirect, incidental, special or consequential damages</li>
                <li>Loss of profits, data, use or other intangible losses</li>
                <li>Damages resulting from use or inability to use the application</li>
                <li>Third-party conduct on the platform</li>
                <li>Unauthorized access or alteration of your transmissions or data</li>
                <li>Any matter related to the application</li>
              </ul>
              <p className="leading-relaxed font-medium">
                THIS LIMITATION APPLIES REGARDLESS OF LEGAL THEORY (CONTRACT, TORT OR OTHERWISE) 
                AND EVEN IF THE DEVELOPER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Indemnification</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed font-medium">
                You agree to indemnify, defend and hold harmless the developer from any claim, 
                damage, obligation, loss, liability, cost or debt, and expense (including attorney fees) 
                arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of the application</li>
                <li>Violation of these Terms of Service</li>
                <li>Violation of any third-party rights</li>
                <li>Your behavior on the platform</li>
                <li>Participation in suggested challenges or activities</li>
              </ul>
            </div>
          </section>

          {/* Age Restriction */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Age Restriction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This application is intended for users 18 years or older. Users under 18 must have 
              parental or guardian permission and use the platform under their supervision and responsibility.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Terms Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will take effect 
              immediately upon publication. Continued use of the application constitutes acceptance 
              of the modified terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your access to the application at any time, for any reason, 
              without prior notice. These terms will remain in effect even after termination.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by Brazilian law. Any disputes will be resolved in the 
              competent courts of Brazil.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these terms, please contact us through the application or 
              official ESN channels.
            </p>
          </section>

          {/* Acceptance Confirmation */}
          <section className="border-t pt-8">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-primary font-medium">
                  ✅ By using this application, you confirm that you have read, understood and agree 
                  to all terms described above.
                </p>
              </CardContent>
            </Card>
          </section>
        </Card>
      </div>
    </div>
  );
}
