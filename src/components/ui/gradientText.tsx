const GradientText = ({ text }: { text: string }) => {
    return <h1 className="text-left w-full ml-8! scale-x-[1.8] origin-left text-4xl font-extrabold tracking-[-1px] bg-gradient-to-br from-foreground via-primary to-primary bg-clip-text text-transparent mb-[0px]">
        {text}
    </h1>

};
export default GradientText;