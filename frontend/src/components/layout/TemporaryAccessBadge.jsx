import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TemporaryAccessBadge = () => {
    const { temporaryAccess } = useAuth();

    if (!temporaryAccess) return null;

    return (
        <div className="mb-6 rounded-md bg-amber-50 p-4 border border-amber-200 animate-pulse">
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Temporary Access Granted</h3>
                    <div className="mt-2 text-sm text-amber-700">
                        <p>
                            You possess elevated Write-Access for <span className="font-semibold">{temporaryAccess.action}</span>.{' '}
                            (Expires at {temporaryAccess.expiresAt})
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
