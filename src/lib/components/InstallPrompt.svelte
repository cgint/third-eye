<script lang="ts">
	import { onMount } from 'svelte';
	
	let showInstallPrompt = $state(false);
	let deferredPrompt: any = null;
	let isInstalled = $state(false);
	
	onMount(() => {
		// Check if app is already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			isInstalled = true;
			return;
		}
		
		// Listen for the beforeinstallprompt event
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstallPrompt = true;
		});
		
		// Listen for app installed event
		window.addEventListener('appinstalled', () => {
			showInstallPrompt = false;
			isInstalled = true;
			deferredPrompt = null;
		});
	});
	
	async function handleInstallClick() {
		if (!deferredPrompt) return;
		
		deferredPrompt.prompt();
		const choiceResult = await deferredPrompt.userChoice;
		
		if (choiceResult.outcome === 'accepted') {
			console.log('User accepted the install prompt');
		}
		
		deferredPrompt = null;
		showInstallPrompt = false;
	}
	
	function dismissPrompt() {
		showInstallPrompt = false;
	}
</script>

{#if showInstallPrompt && !isInstalled}
	<div class="install-prompt">
		<div class="install-content">
			<div class="install-icon">📱</div>
			<div class="install-text">
				<h3>Install Third Eye</h3>
				<p>Get quick access to product analysis right from your home screen!</p>
			</div>
			<div class="install-actions">
				<button class="install-btn" onclick={handleInstallClick}>
					Install App
				</button>
				<button class="dismiss-btn" onclick={dismissPrompt}>
					Not now
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.install-prompt {
		position: fixed;
		bottom: 16px;
		left: 16px;
		right: 16px;
		background: #1a1a1a;
		color: white;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		animation: slideUp 0.3s ease-out;
	}
	
	.install-content {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	
	.install-icon {
		font-size: 24px;
		flex-shrink: 0;
	}
	
	.install-text {
		flex: 1;
		text-align: left;
	}
	
	.install-text h3 {
		margin: 0 0 4px 0;
		font-size: 16px;
		font-weight: 600;
	}
	
	.install-text p {
		margin: 0;
		font-size: 14px;
		opacity: 0.8;
		line-height: 1.3;
	}
	
	.install-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex-shrink: 0;
	}
	
	.install-btn {
		background: #007AFF;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		min-height: 44px;
		min-width: 80px;
	}
	
	.install-btn:hover {
		background: #0056CC;
	}
	
	.dismiss-btn {
		background: transparent;
		color: #8E8E93;
		border: 1px solid #48484A;
		border-radius: 8px;
		padding: 6px 12px;
		font-size: 12px;
		cursor: pointer;
		min-height: 32px;
	}
	
	.dismiss-btn:hover {
		background: #48484A;
		color: white;
	}
	
	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	/* Mobile responsive */
	@media (max-width: 480px) {
		.install-prompt {
			left: 8px;
			right: 8px;
			bottom: 8px;
		}
		
		.install-content {
			flex-direction: column;
			text-align: center;
		}
		
		.install-actions {
			flex-direction: row;
			justify-content: center;
		}
	}
</style> 