class ApiResponse
{
    constructor(statusCode,data,message="success")
{
    this.statusCode=statusCode;
    this.data=data;
    this.message=message;
    this.success=statusCode<400;//here we pass our status code it is less than 400 then it will success;
}
}