declare global {
	namespace Express {
		interface Request {
			user?: {
				_id: string;
				userId: string;
				name: string;
				email: string;
				role: string;
				isSuperAdmin: boolean;
				isActive: boolean;
				categoryPermissions: {
					canCreate: boolean;
					canUpdate: boolean;
					canDelete: boolean;
				};
			};
			product?: any;
			targetUser?: any;
		}
	}
}
