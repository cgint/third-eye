<script lang="ts">
	import { onMount } from 'svelte';
	
	let showInstallPrompt = $state(false);
	let deferredPrompt: any = null;
	let isInstalled = $state(false);
	let isMobile = $state(false);
	
	onMount(() => {
		// Check if device is mobile
		isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
				   window.innerWidth <= 768;
		
		// Only proceed if mobile
		if (!isMobile) return;
		
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

{#if showInstallPrompt && !isInstalled && isMobile}
	<div class="install-prompt">
		<div class="install-content">
			<div class="install-info">
				<span class="install-icon">📱</span>
				<span class="install-text">Install Third Eye</span>
			</div>
			<div class="install-actions">
				<button class="install-btn" onclick={handleInstallClick}>
					Install
				</button>
				<button class="dismiss-btn" onclick={dismissPrompt}>
					×
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.install-prompt {
		position: fixed;
		bottom: 12px;
		left: 12px;
		right: 12px;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(10px);
		color: white;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		z-index: 1000;
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.install-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		gap: 12px;
	}
	
	.install-info {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}
	
	.install-icon {
		font-size: 16px;
		line-height: 1;
	}
	
	.install-text {
		font-size: 14px;
		font-weight: 500;
		color: white;
		line-height: 1;
	}
	
	.install-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	
	.install-btn {
		background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
		color: white;
		border: none;
		border-radius: 12px;
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
	}
	
	.install-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
	}
	
	.install-btn:active {
		transform: translateY(0);
	}
	
	.dismiss-btn {
		background: transparent;
		color: rgba(255, 255, 255, 0.6);
		border: none;
		border-radius: 8px;
		padding: 4px;
		font-size: 18px;
		font-weight: 300;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}
	
	.dismiss-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
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
	
	/* Only show on mobile viewports */
	@media (min-width: 769px) {
		.install-prompt {
			display: none;
		}
	}
</style> 