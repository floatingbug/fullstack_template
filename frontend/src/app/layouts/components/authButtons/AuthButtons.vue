<script setup>
const emit = defineEmits(['authButton:action'])

function onAuthButtonPress(action) {
	emit('authButton:action', { action })
}
</script>

<template>
	<div class="auth-buttons">
		<Button
			label="Sign in"
			severity="secondary"
			@click="onAuthButtonPress('signIn')"
			:pt="{
				root: {
					style: 'box-shadow: var(--shadow-sm)',
				},
			}"
		/>

		<Button
			label="Sign up"
			@click="onAuthButtonPress('signUp')"
			:pt="{
				root: {
					style: 'box-shadow: var(--shadow-sm)',
				},
			}"
		/>
	</div>
</template>

<style scoped>
.auth-buttons {
	display: flex;
	gap: var(--space-md);
}
</style>
