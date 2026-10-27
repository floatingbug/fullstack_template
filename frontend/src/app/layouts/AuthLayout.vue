<script setup>
import { useRouter } from 'vue-router'
import { Logo } from '@/shared/components'

const router = useRouter()

function onLogoPress() {
	router.push('/')
}
</script>

<template>
	<div class="auth-layout">
		<div class="logo-container">
			<Logo @logo:press="onLogoPress" />
		</div>

		<div class="auth-container">
			<RouterView />
		</div>
	</div>
</template>

<style scoped>
.auth-layout {
	width: 100%;
	height: 100dvh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.auth-container {
	width: 100%;
	max-width: 420px;
	padding: var(--space-lg);
}
</style>
