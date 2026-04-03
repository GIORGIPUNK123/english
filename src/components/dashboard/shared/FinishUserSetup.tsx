import { FormEvent, useState } from 'react';
import { updateUserNames } from '../../../firebase/firebaseUserUtils';

type FinishUserSetupProps = {
	isOpen: boolean;
};

export const FinishUserSetup = ({ isOpen }: FinishUserSetupProps) => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isOpen) return null;

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setError(null);

		const trimmedFirst = firstName.trim();
		const trimmedLast = lastName.trim();

		if (trimmedFirst.length < 2 || trimmedLast.length < 2) {
			setError('First and last name must be at least 2 characters.');
			return;
		}

		setIsSubmitting(true);
		try {
			await updateUserNames(trimmedFirst, trimmedLast);
			setFirstName('');
			setLastName('');
		} catch (err: any) {
			setError(err?.message || 'Failed to update your name.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4'>
			<div className='w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8'>
				<h2 className='text-2xl font-semibold text-foreground'>
					Finish setting up your account
				</h2>
				<p className='mt-2 text-sm text-muted-foreground'>
					Please add your first and last name. This is a one-time update.
				</p>

				<form onSubmit={handleSubmit} className='mt-6 space-y-4'>
					<div>
						<label className='block text-sm font-medium text-foreground'>
							First name
						</label>
						<input
							value={firstName}
							onChange={(event) => setFirstName(event.target.value)}
							type='text'
							autoComplete='given-name'
							className='mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
							placeholder='Enter your first name'
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground'>
							Last name
						</label>
						<input
							value={lastName}
							onChange={(event) => setLastName(event.target.value)}
							type='text'
							autoComplete='family-name'
							className='mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
							placeholder='Enter your last name'
							required
						/>
					</div>

					{error && <p className='text-sm text-red-500'>{error}</p>}

					<button
						type='submit'
						disabled={isSubmitting}
						className='w-full rounded-lg bg-linear-to-r from-blue-500 to-purple-600 px-4 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60'
					>
						{isSubmitting ? 'Saving...' : 'Save name'}
					</button>
				</form>
			</div>
		</div>
	);
};
