function joinClasses(...classes) {
	return classes.filter(Boolean).join(" ");
}

function UnderlinedHeading({
	as: Tag = "h2",
	children,
	className = "",
	textColorClass = "",
	sizeClass = "",
	centered = false,
	underlineClassName = "",
}) {
	return (
		<Tag
			className={joinClasses(
				"relative inline-block w-fit pb-2",
				sizeClass,
				textColorClass,
				centered ? "mx-auto text-center" : "",
				className
			)}
		>
			{children}
			<span
				className={joinClasses(
					"absolute left-0 bottom-0 h-[3px] w-full rounded-full bg-[#B32020]",
					underlineClassName
				)}
			></span>
		</Tag>
	);
}

export function PageTitle({
	children,
	className = "",
	textColorClass = "text-white",
	centered = false,
	underlineClassName = "",
}) {
	return (
		<UnderlinedHeading
			as="h1"
			sizeClass="text-2xl md:text-3xl font-semibold"
			textColorClass={textColorClass}
			className={className}
			centered={centered}
			underlineClassName={underlineClassName}
		>
			{children}
		</UnderlinedHeading>
	);
}

export function SectionTitle({
	as = "h2",
	children,
	className = "",
	textColorClass = "text-[#0C2D70]",
	centered = false,
	underlineClassName = "",
}) {
	return (
		<UnderlinedHeading
			as={as}
			sizeClass="text-xl md:text-2xl font-semibold"
			textColorClass={textColorClass}
			className={className}
			centered={centered}
			underlineClassName={underlineClassName}
		>
			{children}
		</UnderlinedHeading>
	);
}