<script setup>
import { Sidebar, Topbar, UserMenu } from "@/shared/components";

</script>

<template>
	<div class="app-layout">
		<Topbar class="topbar">
			<template #end>
				<div class="topbar-end">
					<UserMenu
					/>
				</div>
			</template>
		</Topbar>

		<Sidebar class="sidebar"
		/>

		<div class="main">
			<RouterView />
		</div>
	</div>
</template>

<style scoped lang="scss">
@use "@/shared/styles/breakpoints" as bp;
@use "@/shared/styles/media" as media;

.app-layout {

	@include media.up(bp.$bp-lg) {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto 1fr;
		grid-template-areas:
			"sidebar topbar"
			"sidebar main";
		user-select: none;
	}
}

.topbar {
	grid-area: topbar;
	width: 100%;
	position: sticky;
	top: 0;
	z-index: 10;
}

.sidebar {
	grid-area: sidebar;
	width: var(--sidebar-width);
	height: 100dvh;
	position: sticky;
	top: 0;
	display: none;
	background-color: var(--sidebar-bg);
	border-right: 1px solid var(--sidebar-border);

	@include media.up(bp.$bp-lg){
		display: block;
	}
}

.main {
	grid-area: main;
	width: 100%;
	display: flex;
	justify-content: center;
	margin-bottom: 12rem;
}
</style>

