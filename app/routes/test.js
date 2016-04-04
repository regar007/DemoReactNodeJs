var sum = function(num1){
	return function(num2){
		return function(num3){
			if(num3)
				return num1 + num2 + num3;
			else
				return num2 + num1;
		};
	};

};

//console.log(sum(3)(2)());


// sum(2)(4)(5)(7)(1)(9)();

var sum1 = function(num1){
	if(num1){
		return function(num2){
					if(num2){
						return sum1(num1 + num2);
					}else
						return num1;
				};
	}else{
		return "No Input";
	}
};

//console.log(sum1(1)(8)());